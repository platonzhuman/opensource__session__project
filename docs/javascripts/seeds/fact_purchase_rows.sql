-- Демо-ресурсы для курса «факт закупки»
drop table if exists fact_purchase cascade;
drop table if exists dim_product cascade;
drop table if exists dim_unit cascade;
drop table if exists dim_group cascade;
drop table if exists dim_vendor cascade;
drop table if exists dim_time cascade;
drop sequence if exists seq_fact_purchase;

create table dim_product (id integer primary key, name text not null);
create table dim_unit (id integer primary key, name text not null);
create table dim_group (id integer primary key, name text not null);
create table dim_vendor (id integer primary key, name text not null);
create table dim_time (id integer primary key, month_name text not null, year integer not null);

insert into dim_product (id, name) values (1, 'Мука'), (2, 'Сахар');
insert into dim_unit (id, name) values (1, 'кг'), (2, 'уп.');
insert into dim_group (id, name) values (1, 'Бакалея'), (2, 'Кондитерка');
insert into dim_vendor (id, name) values (1, 'Поставщик А'), (2, 'Поставщик Б');
insert into dim_time (id, month_name, year) values (1, 'Ноябрь', 2026), (2, 'Декабрь', 2026);

create sequence seq_fact_purchase;
create table fact_purchase (
    id bigint primary key default nextval('seq_fact_purchase'),
    code bigint not null unique,
    product_id integer not null references dim_product(id),
    unit_id integer not null references dim_unit(id),
    group_id integer not null references dim_group(id),
    vendor_id integer not null references dim_vendor(id),
    quantity numeric(12,3) not null check (quantity >= 0),
    amount numeric(14,2) not null check (amount >= 0),
    date_add date not null default current_date,
    time_id integer not null references dim_time(id)
);
insert into fact_purchase (code, product_id, unit_id, group_id, vendor_id, quantity, amount, date_add, time_id)
values
(1001, 1, 1, 1, 1, 10, 500.00, '2026-11-27', 1),
(1002, 2, 2, 2, 2, 3, 300.00, '2026-11-27', 1);
