-- Сид meteo_final: база учителя после 20261014 → 20261021_1 → 20261028 → 20261102.
-- Данные Таблиц 2 и 3 оставлены как у учителя, вместе с ошибками: их исправление — часть итогового ДЗ.
--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: input_params_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.input_params_type AS (
	height numeric(8,2),
	temperature numeric(8,2),
	pressure numeric(8,2),
	wind_direction numeric(8,2),
	wind_speed numeric(8,2),
	bullet_demolition_range numeric(8,2)
);


--
-- Name: TYPE input_params_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.input_params_type IS 'Тип для входных параметров';


--
-- Name: check_result_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.check_result_type AS (
	is_check boolean,
	error_message text,
	params public.input_params_type
);


--
-- Name: TYPE check_result_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.check_result_type IS 'Тип с результатами проверки';


--
-- Name: interpolation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.interpolation_type AS (
	x0 numeric(8,2),
	x1 numeric(8,2),
	y0 numeric(8,2),
	y1 numeric(8,2)
);


--
-- Name: TYPE interpolation_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.interpolation_type IS 'Отдельный тип для рассчета интегрполяции';


--
-- Name: fn_calc_header_period(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calc_header_period(par_period timestamp with time zone) RETURNS text
    LANGUAGE plpgsql
    AS $$
		declare 
			  var_result text;
		begin	
		  			var_result := (select
		                -- ДД
		                case when (extract(day from par_period) < 10::numeric) then '0'::text else ''::text end || 
		                extract(day from par_period)::text || 
		                -- ЧЧ
		                case when (extract(hour from par_period) < 10::numeric) then '0'::text else ''::text end || 
		                extract(hour from par_period)::text || 
		                -- Десятки минут
		                case when (extract(minute from par_period) < 10::numeric) then '0'::text
		                                else 
		                left(extract(minute from par_period)::text, 1) 
		                end);
	
					return 	var_result;
	
		end;
		$$;


--
-- Name: FUNCTION fn_calc_header_period(par_period timestamp with time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calc_header_period(par_period timestamp with time zone) IS 'Функция для формирования даты в специальном формате';


--
-- Name: fn_calc_header_pressure(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calc_header_pressure(par_pressure numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
		declare
		        default_pressure numeric(8,2) default 750;
		        table_pressure numeric(8,2) default null;
		        default_pressure_key character varying default 'calc_table_pressure' ;
		begin
		
		        raise notice 'Расчет отклонения наземного давления для %', par_pressure;
		
		        -- Определяем граничное табличное значение
		        if not exists (select 1 from public.measurment_settings where key = default_pressure_key ) then
		        Begin
		                table_pressure :=  default_pressure;
		        end;
		        else
		        begin
		                select value::numeric(18,2) 
		                into table_pressure
		                from  public.measurment_settings where key = default_pressure_key;
		        end;
		        end if;
		
		
		        -- Результат
		        return par_pressure - coalesce(table_pressure,table_pressure) ;
		
		end;
		$$;


--
-- Name: FUNCTION fn_calc_header_pressure(par_pressure numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calc_header_pressure(par_pressure numeric) IS 'Функция для расчета отклонения наземного давления';


--
-- Name: fn_calc_header_temperature(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calc_header_temperature(par_temperature numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
		declare
		        default_temperature numeric(8,2) default 15.9;
		        default_temperature_key character varying default 'calc_table_temperature' ;
		        virtual_temperature numeric(8,2) default 0;
		        deltaTv numeric(8,2) default 0;
		        var_result numeric(8,2) default 0;
		begin   
		
		        raise notice 'Расчет отклонения приземной виртуальной температуры по температуре %', par_temperature;
		
		        -- Определим табличное значение температуры
		        Select coalesce(value::numeric(8,2), default_temperature) 
		        from public.measurment_settings 
		        into virtual_temperature
		        where 
		                key = default_temperature_key;
		
		    -- Вирутальная поправка
		        deltaTv := par_temperature + 
		                public.fn_calc_temperature_interpolation(par_temperature => par_temperature);
		                
		        -- Отклонение приземной виртуальной температуры
		        var_result := deltaTv - virtual_temperature;
		        
		        return var_result;
		end;
		$$;


--
-- Name: FUNCTION fn_calc_header_temperature(par_temperature numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calc_header_temperature(par_temperature numeric) IS 'Функция для расчета отклонения приземной виртуальной температуры';


--
-- Name: fn_calc_interpolation(numeric, public.interpolation_type); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calc_interpolation(par_x numeric, par_interpolation public.interpolation_type) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
	begin
	 		if par_interpolation.x1 = par_interpolation.x0 then
                return par_interpolation.y0;
            end if;

            return 
				round( par_interpolation.y0 + (par_x - par_interpolation.x0) * (par_interpolation.y1 - par_interpolation.y0) / (par_interpolation.x1 - par_interpolation.x0) , 2);
	end;
	$$;


--
-- Name: FUNCTION fn_calc_interpolation(par_x numeric, par_interpolation public.interpolation_type); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calc_interpolation(par_x numeric, par_interpolation public.interpolation_type) IS 'Расчет интерполяции';


--
-- Name: fn_calc_temperature_interpolation(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calc_temperature_interpolation(par_temperature numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
				        declare 
				                var_interpolation interpolation_type;
				                var_result numeric(8,2) default 0;
				                var_min_temparure numeric(8,2) default 0;
				                var_max_temperature numeric(8,2) default 0;
				                var_denominator numeric(8,2) default 0;
				        begin
				
				                                raise notice 'Расчет интерполяции для температуры %', par_temperature;
				
				                -- Проверим, возможно температура совпадает со значением в справочнике
				                if exists (select 1 from public.calc_correction_temperature where temperature = par_temperature ) then
				                begin
				                        select correction 
				                        into  var_result 
				                        from  public.calc_correction_temperature
				                        where 
				                                temperature = par_temperature;
				                end;
				                else    
				                begin
				                        -- Получим диапазон в котором работают поправки
				                        select min(temperature), max(temperature) 
				                        into var_min_temparure, var_max_temperature
				                        from public.calc_correction_temperature;
				
				                        if par_temperature < var_min_temparure or   
				                           par_temperature > var_max_temperature then
				
				                                raise exception 'Некорректно передан параметр! Невозможно рассчитать поправку. Значение должно укладываться в диаппазон: %, %',
				                                        var_min_temparure, var_max_temperature;
				                        end if;   
				
				                        -- Получим граничные параметры
				
				                        select x0, y0, x1, y1 
				                                                 into var_interpolation.x0, var_interpolation.y0, var_interpolation.x1, var_interpolation.y1
				                        from
				                        (
				                                select t1.temperature as x0, t1.correction as y0
				                                from public.calc_correction_temperature as t1
				                                where t1.temperature <= par_temperature
				                                order by t1.temperature desc
				                                limit 1
				                        ) as leftPart
				                        cross join
				                        (
				                                select t1.temperature as x1, t1.correction as y1
				                                from public.calc_correction_temperature as t1
				                                where t1.temperature >= par_temperature
				                                order by t1.temperature 
				                                limit 1
				                        ) as rightPart;
				
				                        raise notice 'Граничные значения %', var_interpolation;
				                        var_result :=  fn_calc_interpolation( par_temperature,  var_interpolation);
				                                                 
				                end;
				                end if;
				
				                                return var_result;
				
				end;
				
		$$;


--
-- Name: FUNCTION fn_calc_temperature_interpolation(par_temperature numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calc_temperature_interpolation(par_temperature numeric) IS 'Функция для расчета интерполяции для метео приближенный';


--
-- Name: fn_check_input_params(public.input_params_type); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_check_input_params(par_param public.input_params_type) RETURNS public.input_params_type
    LANGUAGE plpgsql
    AS $$
		declare
		        var_result check_result_type;
		begin
		
		        var_result := fn_check_input_params(
		                par_param.height, par_param.temperature, par_param.pressure, par_param.wind_direction,
		                par_param.wind_speed, par_param.bullet_demolition_range
		        );
		
		        if var_result.is_check = False then
		                raise exception 'Ошибка %', var_result.error_message;
		        end if;
		
		        return var_result.params;
		end ;
		$$;


--
-- Name: FUNCTION fn_check_input_params(par_param public.input_params_type); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_check_input_params(par_param public.input_params_type) IS 'Функция для проверки параметров';


--
-- Name: fn_check_input_params(numeric, numeric, numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_check_input_params(par_height numeric, par_temperature numeric, par_pressure numeric, par_wind_direction numeric, par_wind_speed numeric, par_bullet_demolition_range numeric) RETURNS public.check_result_type
    LANGUAGE plpgsql
    AS $$
		declare
		        var_result public.check_result_type;
		begin
		        var_result.is_check := False;
		
		        -- Температура
		        if not exists (
		                select 1 from (
		                                select 
		                                                coalesce(min_temperature , '0')::numeric(8,2) as min_temperature, 
		                                                coalesce(max_temperature, '0')::numeric(8,2) as max_temperature
		                                from 
		                                (select 1 ) as t
		                                        cross join
		                                        ( select value as  min_temperature from public.measurment_settings where key = 'min_temperature' ) as t1
		                                        cross join 
		                                        ( select value as  max_temperature from public.measurment_settings where key = 'max_temperature' ) as t2
		                                ) as t
		                        where
		                                par_temperature between min_temperature and max_temperature
		                        ) then
		
		                        var_result.error_message := format('Температура % не укладывает в диаппазон!', par_temperature);
		        end if;
		
		        var_result.params.temperature := par_temperature;
		
		
		        -- Давление
		        if not exists (
		                select 1 from (
		                        select 
		                                        coalesce(min_pressure , '0')::numeric(8,2) as min_pressure, 
		                                        coalesce(max_pressure, '0')::numeric(8,2) as max_pressure
		                        from 
		                        (select 1 ) as t
		                                cross join
		                                ( select value as  min_pressure from public.measurment_settings where key = 'min_pressure' ) as t1
		                                cross join 
		                                ( select value as  max_pressure from public.measurment_settings where key = 'max_pressure' ) as t2
		                        ) as t
		                        where
		                                par_pressure between min_pressure and max_pressure
		                                ) then
		
		                        var_result.error_message := format('Давление %s не укладывает в диаппазон!', par_pressure);
		        end if;
		
		        var_result.params.pressure := par_pressure;
		
		                -- Высота
		                if not exists (
		                        select 1 from (
		                                select 
		                                                coalesce(min_height , '0')::numeric(8,2) as min_height, 
		                                                coalesce(max_height, '0')::numeric(8,2) as  max_height
		                                from 
		                                (select 1 ) as t
		                                        cross join
		                                        ( select value as  min_height from public.measurment_settings where key = 'min_height' ) as t1
		                                        cross join 
		                                        ( select value as  max_height from public.measurment_settings where key = 'max_height' ) as t2
		                                ) as t
		                                where
		                                par_height between min_height and max_height
		                                ) then
		
		                                var_result.error_message := format('Высота  %s не укладывает в диаппазон!', par_height);
		                end if;
		
		                var_result.params.height := par_height;
		
		                -- Напрвление ветра
		                if not exists (
		                        select 1 from (
		                                select 
		                                                coalesce(min_wind_direction , '0')::numeric(8,2) as min_wind_direction, 
		                                                coalesce(max_wind_direction, '0')::numeric(8,2) as max_wind_direction
		                                from 
		                                (select 1 ) as t
		                                        cross join
		                                        ( select value as  min_wind_direction from public.measurment_settings where key = 'min_wind_direction' ) as t1
		                                        cross join 
		                                        ( select value as  max_wind_direction from public.measurment_settings where key = 'max_wind_direction' ) as t2
		                        )
		                                where
		                                        par_wind_direction between min_wind_direction and max_wind_direction
		                        ) then
		
		                        var_result.error_message := format('Направление ветра %s не укладывает в диаппазон!', par_wind_direction);
		        end if;
		
		        var_result.params.wind_direction := par_wind_direction;
		        var_result.params.wind_speed := par_wind_speed;
		
		        if coalesce(var_result.error_message,'') = ''  then
		                var_result.is_check = True;
		        end if;
		
		        return var_result;
		
		end;
		$$;


--
-- Name: FUNCTION fn_check_input_params(par_height numeric, par_temperature numeric, par_pressure numeric, par_wind_direction numeric, par_wind_speed numeric, par_bullet_demolition_range numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_check_input_params(par_height numeric, par_temperature numeric, par_pressure numeric, par_wind_direction numeric, par_wind_speed numeric, par_bullet_demolition_range numeric) IS 'Функция для проверки входных параметров';


--
-- Name: seq_base_units; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_base_units
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: base_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.base_units (
    id integer DEFAULT nextval('public.seq_base_units'::regclass) NOT NULL,
    name text
);


--
-- Name: TABLE base_units; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.base_units IS 'Базовые единицы измерения';


--
-- Name: COLUMN base_units.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.base_units.id IS 'Уникальный код';


--
-- Name: COLUMN base_units.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.base_units.name IS 'Наименование';


--
-- Name: calc_correction_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calc_correction_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calc_correction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calc_correction (
    id integer DEFAULT nextval('public.calc_correction_seq'::regclass) NOT NULL,
    height_id integer NOT NULL,
    type_id integer NOT NULL,
    row_values integer[]
);


--
-- Name: TABLE calc_correction; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.calc_correction IS 'Универсальная таблица корректировок';


--
-- Name: COLUMN calc_correction.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction.id IS 'Уникальный код';


--
-- Name: COLUMN calc_correction.height_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction.height_id IS 'Код высоты';


--
-- Name: COLUMN calc_correction.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction.type_id IS 'Код типа таблиц';


--
-- Name: COLUMN calc_correction.row_values; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction.row_values IS 'Значения с корректировками';


--
-- Name: calc_correction_height_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calc_correction_height_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calc_correction_heights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calc_correction_heights (
    id integer DEFAULT nextval('public.calc_correction_height_seq'::regclass) NOT NULL,
    height integer NOT NULL
);


--
-- Name: TABLE calc_correction_heights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.calc_correction_heights IS 'Таблица стандартных высот';


--
-- Name: COLUMN calc_correction_heights.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_heights.id IS 'Уникальный код';


--
-- Name: COLUMN calc_correction_heights.height; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_heights.height IS 'Высота';


--
-- Name: calc_correction_temperature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calc_correction_temperature (
    temperature numeric(8,2) NOT NULL,
    correction numeric(8,2) NOT NULL
);


--
-- Name: calc_correction_types_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calc_correction_types_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calc_correction_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calc_correction_types (
    id integer DEFAULT nextval('public.calc_correction_types_seq'::regclass) NOT NULL,
    parent_id integer,
    measurment_equipment_id integer,
    description text NOT NULL,
    header_values integer[]
);


--
-- Name: TABLE calc_correction_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.calc_correction_types IS 'Справочник типов таблиц с собственными заголовками';


--
-- Name: COLUMN calc_correction_types.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_types.id IS 'Уникальный код';


--
-- Name: COLUMN calc_correction_types.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_types.parent_id IS 'Уникальный код владельца - тип таблицы';


--
-- Name: COLUMN calc_correction_types.measurment_equipment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_types.measurment_equipment_id IS 'Тип оборудования';


--
-- Name: COLUMN calc_correction_types.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_types.description IS 'Описание к таблице';


--
-- Name: COLUMN calc_correction_types.header_values; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.calc_correction_types.header_values IS 'Значения в заголовке таблице';


--
-- Name: seq_employees; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_employees
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer DEFAULT nextval('public.seq_employees'::regclass) NOT NULL,
    name text,
    birthday timestamp without time zone,
    military_position_id integer
);


--
-- Name: TABLE employees; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.employees IS 'Пользователи';


--
-- Name: COLUMN employees.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.id IS 'Уникальный код';


--
-- Name: COLUMN employees.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.name IS 'Наименование';


--
-- Name: COLUMN employees.birthday; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.birthday IS 'Дата рождения';


--
-- Name: COLUMN employees.military_position_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.military_position_id IS 'Уникальный код должности';


--
-- Name: seq_measurement_parameter_types; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_measurement_parameter_types
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: measurement_parameter_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurement_parameter_types (
    id integer DEFAULT nextval('public.seq_measurement_parameter_types'::regclass) NOT NULL,
    name text,
    unit_id integer,
    measurment_equipment_id integer
);


--
-- Name: TABLE measurement_parameter_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.measurement_parameter_types IS 'Справочник типов параметров';


--
-- Name: COLUMN measurement_parameter_types.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurement_parameter_types.id IS 'Уникальный код';


--
-- Name: COLUMN measurement_parameter_types.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurement_parameter_types.name IS 'Наименование';


--
-- Name: COLUMN measurement_parameter_types.unit_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurement_parameter_types.unit_id IS 'Уникальный код единицы измерения';


--
-- Name: COLUMN measurement_parameter_types.measurment_equipment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurement_parameter_types.measurment_equipment_id IS 'Уникальный код оборудования';


--
-- Name: seq_measurment_batchs; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_measurment_batchs
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: measurment_batchs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurment_batchs (
    id integer DEFAULT nextval('public.seq_measurment_batchs'::regclass) NOT NULL,
    emploee_id integer,
    measurment_equipment_id integer,
    started timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE measurment_batchs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.measurment_batchs IS 'Пачки';


--
-- Name: COLUMN measurment_batchs.emploee_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_batchs.emploee_id IS 'Уникальный код пользователя';


--
-- Name: COLUMN measurment_batchs.measurment_equipment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_batchs.measurment_equipment_id IS 'Уникальный код оборудования';


--
-- Name: COLUMN measurment_batchs.started; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_batchs.started IS 'Дата измерения';


--
-- Name: seq_measurment_equipment; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_measurment_equipment
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: measurment_equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurment_equipment (
    id integer DEFAULT nextval('public.seq_measurment_equipment'::regclass) NOT NULL,
    short_name character varying(50),
    description text
);


--
-- Name: TABLE measurment_equipment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.measurment_equipment IS 'Измерительное оборудование';


--
-- Name: COLUMN measurment_equipment.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_equipment.id IS 'Уникальный код';


--
-- Name: COLUMN measurment_equipment.short_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_equipment.short_name IS 'Краткое наименование';


--
-- Name: COLUMN measurment_equipment.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_equipment.description IS 'Описание';


--
-- Name: seq_measurment_input_params; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_measurment_input_params
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: measurment_input_params; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurment_input_params (
    id integer DEFAULT nextval('public.seq_measurment_input_params'::regclass) NOT NULL,
    measurment_batch_id integer,
    measurement_parameter_type_id integer,
    measurement_value numeric(10,2)
);


--
-- Name: TABLE measurment_input_params; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.measurment_input_params IS 'Таблица с параметрами';


--
-- Name: COLUMN measurment_input_params.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_input_params.id IS 'Уникальный код';


--
-- Name: COLUMN measurment_input_params.measurment_batch_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.measurment_input_params.measurment_batch_id IS 'Уникальный код пачки';


--
-- Name: measurment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurment_settings (
    key character varying(100) NOT NULL,
    value character varying(255),
    description text
);


--
-- Name: TABLE measurment_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.measurment_settings IS 'Таблица с настройками';


--
-- Name: seq_military_positions; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_military_positions
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: military_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.military_positions (
    id integer DEFAULT nextval('public.seq_military_positions'::regclass) NOT NULL,
    description character varying(255)
);


--
-- Name: TABLE military_positions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.military_positions IS 'Справочник должностей';


--
-- Name: COLUMN military_positions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.military_positions.id IS 'Уникальный код';


--
-- Name: COLUMN military_positions.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.military_positions.description IS 'Описание';


--
-- Name: seq_units; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_units
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    id integer DEFAULT nextval('public.seq_units'::regclass) NOT NULL,
    name text,
    base_unit_id integer,
    convert_factor integer
);


--
-- Name: TABLE units; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.units IS 'Единицы измерения';


--
-- Name: COLUMN units.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units.id IS 'Уникальный код';


--
-- Name: COLUMN units.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units.name IS 'Наименование';


--
-- Name: COLUMN units.base_unit_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units.base_unit_id IS 'Уникальный код базовой единицы измерения';


--
-- Name: COLUMN units.convert_factor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units.convert_factor IS 'Коэффициент пересчета';


--
-- Data for Name: base_units; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.base_units (id, name) VALUES (1, 'Метр');
INSERT INTO public.base_units (id, name) VALUES (2, 'Градус');
INSERT INTO public.base_units (id, name) VALUES (3, 'Паскаль');


--
-- Data for Name: calc_correction; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (1, 1, 8, '{-1,-2,-3,-4,-5,-6,-7,-8,-8,-9,-20,-29,-39,-49}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (2, 2, 8, '{-1,-2,-3,-4,-5,-6,-6,-7,-8,-9,-19,-29,-39,-48}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (3, 3, 8, '{-1,-2,-3,-4,-5,-6,-6,-7,-7,-8,-18,-28,-37,-46}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (4, 4, 8, '{-1,-2,-3,-4,-4,-5,-5,-6,-7,-8,-17,-26,-35,-44}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (5, 1, 7, '{1,2,3,4,5,6,7,8,9,10,20,30}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (6, 2, 7, '{1,2,3,4,5,6,7,8,9,10,20,30}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (7, 3, 7, '{1,2,3,4,5,6,7,8,9,10,20,30}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (8, 4, 7, '{1,2,3,4,5,6,7,8,9,10,20,30}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (9, 1, 4, '{3,4,5,6,7,7,8,9,10,11,12,12}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (10, 2, 4, '{4,5,6,7,8,9,10,11,12,13,14,15}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (11, 3, 4, '{4,5,6,7,8,9,10,11,13,14,15,16}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (12, 4, 4, '{4,5,7,8,8,9,11,12,13,15,15,16}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (13, 1, 5, '{0}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (14, 2, 5, '{1}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (15, 3, 5, '{2}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (16, 4, 5, '{2}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (17, 1, 6, '{4,6,8,9,10,12,14,15,16,18,20,21,22}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (18, 2, 6, '{5,7,10,11,12,14,17,18,20,22,23,25,27}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (19, 3, 6, '{5,8,10,11,13,15,18,19,21,23,25,27,28}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (20, 4, 6, '{5,8,11,12,13,16,19,20,23,24,26,28,30}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (21, 1, 7, '{1}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (22, 2, 7, '{2}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (23, 3, 7, '{3}');
INSERT INTO public.calc_correction (id, height_id, type_id, row_values) VALUES (24, 4, 7, '{3}');


--
-- Data for Name: calc_correction_heights; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.calc_correction_heights (id, height) VALUES (1, 200);
INSERT INTO public.calc_correction_heights (id, height) VALUES (2, 400);
INSERT INTO public.calc_correction_heights (id, height) VALUES (3, 800);
INSERT INTO public.calc_correction_heights (id, height) VALUES (4, 1200);
INSERT INTO public.calc_correction_heights (id, height) VALUES (5, 1600);
INSERT INTO public.calc_correction_heights (id, height) VALUES (6, 2000);
INSERT INTO public.calc_correction_heights (id, height) VALUES (7, 2400);
INSERT INTO public.calc_correction_heights (id, height) VALUES (8, 3000);
INSERT INTO public.calc_correction_heights (id, height) VALUES (9, 4000);


--
-- Data for Name: calc_correction_temperature; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (0.00, 0.50);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (5.00, 0.50);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (10.00, 1.00);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (20.00, 1.00);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (25.00, 2.00);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (30.00, 3.50);
INSERT INTO public.calc_correction_temperature (temperature, correction) VALUES (40.00, 4.50);


--
-- Data for Name: calc_correction_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (1, NULL, NULL, 'Таблица 2', '{0,1,2,3,4,5,6,7,8,8,10,20,30,40,50}');
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (2, NULL, NULL, 'Таблица 3, скорость среднего ветра', NULL);
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (3, NULL, NULL, 'Таблица 3, направление среднего ветра', NULL);
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (4, 2, 2, 'Таблица 3, Скорость среднего ветра (ВР)', '{40,50,60,70,80,90,100,110,120,130,140,150}');
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (5, 3, 2, 'Таблица 3, Направление среднего ветра (ВР)', '{40,50,60,70,80,90,100,110,120,130,140,150}');
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (6, 2, 1, 'Таблица 3, Скорость среднего ветра (ДМК)', '{3,4,5,6,7,8,9,10,11,12,13,14,15}');
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (7, 3, 1, 'Таблица 3, Направление среднего ветра (ДМК)', '{3,4,5,6,7,8,9,10,11,12,13,14,15}');
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (8, 1, NULL, 'Таблица 2, Положительные температуры', NULL);
INSERT INTO public.calc_correction_types (id, parent_id, measurment_equipment_id, description, header_values) VALUES (9, 1, NULL, 'Таблица 2, Отрицательные температуры', NULL);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employees (id, name, birthday, military_position_id) VALUES (1, 'Воловиков Александр Сергеевич', '1978-06-24 00:00:00', 2);


--
-- Data for Name: measurement_parameter_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (1, 'Высота метеопаста', 4, NULL);
INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (2, 'Температура', 2, NULL);
INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (3, 'Давление', 5, NULL);
INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (4, 'Направление ветра', NULL, NULL);
INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (5, 'Скорость ветра', 6, 1);
INSERT INTO public.measurement_parameter_types (id, name, unit_id, measurment_equipment_id) VALUES (6, 'Дальность сноса пуль', NULL, 2);


--
-- Data for Name: measurment_batchs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.measurment_batchs (id, emploee_id, measurment_equipment_id, started) VALUES (1, 1, 1, '2026-09-01 00:00:00');
INSERT INTO public.measurment_batchs (id, emploee_id, measurment_equipment_id, started) VALUES (2, 1, 2, '2026-09-02 00:00:00');


--
-- Data for Name: measurment_equipment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.measurment_equipment (id, short_name, description) VALUES (1, 'ДМК', 'Десантный метео комплекс');
INSERT INTO public.measurment_equipment (id, short_name, description) VALUES (2, 'ВР', 'Ветровое ружье');


--
-- Data for Name: measurment_input_params; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (2, 1, 1, 100.00);
INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (3, 1, 2, 12.00);
INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (4, 1, 3, 34.00);
INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (5, 1, 4, 0.20);
INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (6, 1, 5, 45.00);
INSERT INTO public.measurment_input_params (id, measurment_batch_id, measurement_parameter_type_id, measurement_value) VALUES (7, 1, 6, 0.00);


--
-- Data for Name: measurment_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.measurment_settings (key, value, description) VALUES ('min_temperature', '-10', 'Минимальное значение температуры');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('max_temperature', '50', 'Максимальное значение температуры');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('min_pressure', '500', 'Минимальное значение давления');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('max_pressure', '900', 'Максимальное значение давления');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('min_wind_direction', '0', 'Минимальное значение направления ветра');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('max_wind_direction', '59', 'Максимальное значение направления ветра');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('calc_table_temperature', '15.9', 'Табличное значение температуры');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('calc_table_pressure', '750', 'Табличное значение наземного давления');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('min_height', '0', 'Минимальная высота');
INSERT INTO public.measurment_settings (key, value, description) VALUES ('max_height', '400', 'Максимальная высота');


--
-- Data for Name: military_positions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.military_positions (id, description) VALUES (1, 'Рядовой');
INSERT INTO public.military_positions (id, description) VALUES (2, 'Лейтенант');


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (1, 'Киллометр', 1, 1000);
INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (2, 'Градус', 2, 1);
INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (3, 'Паскаль', 3, 1);
INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (4, 'Метр', 1, 1);
INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (5, 'Миллиметры ртутного столба', NULL, NULL);
INSERT INTO public.units (id, name, base_unit_id, convert_factor) VALUES (6, 'Метр в секунду', NULL, NULL);


--
-- Name: calc_correction_height_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calc_correction_height_seq', 9, true);


--
-- Name: calc_correction_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calc_correction_seq', 24, true);


--
-- Name: calc_correction_types_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calc_correction_types_seq', 9, true);


--
-- Name: seq_base_units; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_base_units', 3, true);


--
-- Name: seq_employees; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_employees', 1, true);


--
-- Name: seq_measurement_parameter_types; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_measurement_parameter_types', 6, true);


--
-- Name: seq_measurment_batchs; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_measurment_batchs', 2, true);


--
-- Name: seq_measurment_equipment; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_measurment_equipment', 2, true);


--
-- Name: seq_measurment_input_params; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_measurment_input_params', 7, true);


--
-- Name: seq_military_positions; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_military_positions', 2, true);


--
-- Name: seq_units; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_units', 6, true);


--
-- Name: calc_correction_heights calc_correction_heights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calc_correction_heights
    ADD CONSTRAINT calc_correction_heights_pkey PRIMARY KEY (id);


--
-- Name: calc_correction calc_correction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calc_correction
    ADD CONSTRAINT calc_correction_pkey PRIMARY KEY (id);


--
-- Name: calc_correction_types calc_correction_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calc_correction_types
    ADD CONSTRAINT calc_correction_types_pkey PRIMARY KEY (id);


--
-- Name: calc_correction_temperature calc_temperature_correction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calc_correction_temperature
    ADD CONSTRAINT calc_temperature_correction_pkey PRIMARY KEY (temperature);


--
-- Name: measurment_settings measurment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_settings
    ADD CONSTRAINT measurment_settings_pkey PRIMARY KEY (key);


--
-- Name: base_units pk_base_units; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.base_units
    ADD CONSTRAINT pk_base_units PRIMARY KEY (id);


--
-- Name: employees pk_employees; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT pk_employees PRIMARY KEY (id);


--
-- Name: measurement_parameter_types pk_measurement_parameter_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_parameter_types
    ADD CONSTRAINT pk_measurement_parameter_types PRIMARY KEY (id);


--
-- Name: measurment_batchs pk_measurment_batchs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_batchs
    ADD CONSTRAINT pk_measurment_batchs PRIMARY KEY (id);


--
-- Name: measurment_equipment pk_measurment_equipment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_equipment
    ADD CONSTRAINT pk_measurment_equipment PRIMARY KEY (id);


--
-- Name: measurment_input_params pk_measurment_input_params; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_input_params
    ADD CONSTRAINT pk_measurment_input_params PRIMARY KEY (id);


--
-- Name: military_positions pk_military_positions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.military_positions
    ADD CONSTRAINT pk_military_positions PRIMARY KEY (id);


--
-- Name: units pk_units; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT pk_units PRIMARY KEY (id);


--
-- Name: employees fk_employees_military_positions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_military_positions FOREIGN KEY (military_position_id) REFERENCES public.military_positions(id);


--
-- Name: measurement_parameter_types fk_measurement_parameter_types_measurment_equipment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_parameter_types
    ADD CONSTRAINT fk_measurement_parameter_types_measurment_equipment FOREIGN KEY (measurment_equipment_id) REFERENCES public.measurment_equipment(id);


--
-- Name: measurement_parameter_types fk_measurement_parameter_types_units; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_parameter_types
    ADD CONSTRAINT fk_measurement_parameter_types_units FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: measurment_batchs fk_measurment_batchs_employees; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_batchs
    ADD CONSTRAINT fk_measurment_batchs_employees FOREIGN KEY (emploee_id) REFERENCES public.employees(id);


--
-- Name: measurment_batchs fk_measurment_batchs_measurment_equipment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_batchs
    ADD CONSTRAINT fk_measurment_batchs_measurment_equipment FOREIGN KEY (measurment_equipment_id) REFERENCES public.measurment_equipment(id);


--
-- Name: measurment_input_params fk_measurment_input_params_measurement_parameter_types; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_input_params
    ADD CONSTRAINT fk_measurment_input_params_measurement_parameter_types FOREIGN KEY (measurement_parameter_type_id) REFERENCES public.measurement_parameter_types(id);


--
-- Name: measurment_input_params fk_measurment_input_params_measurment_batchs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurment_input_params
    ADD CONSTRAINT fk_measurment_input_params_measurment_batchs FOREIGN KEY (measurment_batch_id) REFERENCES public.measurment_batchs(id);


--
-- Name: units fk_units_base_unit; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT fk_units_base_unit FOREIGN KEY (base_unit_id) REFERENCES public.base_units(id);


--
-- PostgreSQL database dump complete
--


