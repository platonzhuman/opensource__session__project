-- ДЗ 5: тип и функции интерполяции
do $$
begin
    -- убираем старый тип, чтобы скрипт можно было запустить повторно
    begin
        drop type if exists public.interpolation_type cascade;
    end;
    commit;

    -- две точки отрезка: левая (x0, y0) и правая (x1, y1)
    begin
        create type public.interpolation_type as (
            x0 numeric, y0 numeric,
            x1 numeric, y1 numeric
        );
    end;
    commit;

    -- функция ищет отрезок, в который попала температура
    begin
        -- par_temperature — имя параметра; число придёт только при вызове функции
        create function public.get_interpolation_type_correction(par_temperature numeric)
        returns public.interpolation_type
        language plpgsql
        as $body$
        declare
            v public.interpolation_type;
        begin
            -- ниже нуля поправка равна нулю
            if par_temperature < 0 then
                v.x0 := 0; v.y0 := 0;
                v.x1 := 0; v.y1 := 0;
                return v;
            end if;

            -- берём четыре поля найденного отрезка
            select t.x0, t.y0, t.x1, t.y1
            -- и раскладываем их по полям composite-переменной
            into v.x0, v.y0, v.x1, v.y1
            from (
                -- текущая строка — левая точка
                select temperature as x0,
                       correction  as y0,
                       -- lead — следующая строка; order by задаёт порядок
                       lead(temperature) over (order by temperature) as x1,
                       lead(correction)  over (order by temperature) as y1
                from public.calc_temperature_correction
            ) t
            -- температура должна попасть между x0 и x1
            where t.x0 <= par_temperature and (t.x1 > par_temperature or t.x1 is null)
            -- если подходящих несколько, берём ближайший слева
            order by t.x0 desc
            limit 1;

            return v;
        end
        $body$;
    end;
    commit;

    -- вторая функция: линейная интерполяция внутри отрезка
    begin
        -- par_x — значение, для которого считаем y; par_point — готовый отрезок
        create function public.interpolate(par_x numeric, par_point public.interpolation_type)
        returns numeric
        language plpgsql
        as $body$
        declare
            -- длины отрезка по x и по y
            dx numeric := par_point.x1 - par_point.x0;
            dy numeric := par_point.y1 - par_point.y0;
        begin
            -- если x1 = x0 или x1 нет, делить нельзя
            if dx = 0 or dx is null then
                return par_point.y0;
            end if;

            -- y0 + доля пути по x * изменение y
            return par_point.y0 + (par_x - par_point.x0) * dy / dx;
        end
        $body$;
    end;
    commit;
end $$;
