-- маленький кусок Front для OLAP-курса
-- это не вся база, только источники для примеров

drop table if exists src_sales cascade;
drop table if exists src_purchase cascade;
drop table if exists src_inventory cascade;
drop table if exists src_personnel cascade;
drop table if exists src_product cascade;
drop table if exists src_vendors cascade;
drop table if exists src_vendorgroup cascade;
drop table if exists src_category cascade;
drop table if exists src_size cascade;
drop table if exists src_storages cascade;

create table src_size (
    id integer primary key,
    sizeid text,
    portionrate numeric(12,3)
);
insert into src_size (id, sizeid, portionrate) values
(1, 'порция', 1.000),
(2, '100г', 100.000),
(3, 'Бут.500мл.', 500.000),
(4, '50 мл', 50.000),
(5, '1 день', 1.000);

create table src_category (
    id integer primary key,
    description text,
    parentid integer
);
insert into src_category (id, description, parentid) values
(147, 'Меню доставка', null),
(148, 'Меню кафе', null),
(150, 'Пицца', null),
(151, '24 см', 150),
(152, 'Мясные', 150),
(200, 'Бакалея', null);

create table src_vendorgroup (
    vendorgroupid integer primary key,
    description text
);
insert into src_vendorgroup (vendorgroupid, description) values
(31, 'Поставщики'),
(32, 'Без названия');

create table src_vendors (
    id integer primary key,
    clientid text,
    clientgroup integer
);
insert into src_vendors (id, clientid, clientgroup) values
(91, 'Габур', 31),
(92, 'Столярская', 31),
(95, 'Вираж', 31);

create table src_product (
    id integer primary key,
    productid text,
    description text,
    categoryid integer,
    vendorid integer
);
insert into src_product (id, productid, description, categoryid, vendorid) values
(4368, '1137721', 'Грудинка (Бекон)', 200, 107),
(4365, '8851029', 'Ветчина', 200, 0),
(4619, '7507011', 'Филе куриное белое', 200, 0);

create table src_storages (
    id integer primary key,
    description text
);
insert into src_storages (id, description) values
(41, 'Склад');

create table src_sales (
    id integer primary key,
    doc_id integer,
    product_id integer,
    qty numeric(12,3),
    amount numeric(12,2),
    dt date
);
insert into src_sales (id, doc_id, product_id, qty, amount, dt) values
(1, 1001, 4368, 2, 500.00, '2024-01-15'),
(2, 1001, 4365, 1, 300.00, '2024-01-15'),
(3, 1002, 4368, 1, 250.00, '2024-02-10'),
(4, 1003, 4619, 3, 600.00, '2024-03-05');

create table src_purchase (
    id integer primary key,
    doc_id integer,
    product_id integer,
    qty numeric(12,3),
    amount numeric(12,2),
    dt date
);
insert into src_purchase (id, doc_id, product_id, qty, amount, dt) values
(1, 2001, 4368, 10, 2000.00, '2024-01-05'),
(2, 2002, 4365, 5, 1500.00, '2024-02-07'),
(3, 2003, 4619, 8, 2400.00, '2024-03-09');

create table src_inventory (
    id integer primary key,
    product_id integer,
    storage_id integer,
    qty numeric(12,3),
    amount numeric(12,2),
    dt date
);
insert into src_inventory (id, product_id, storage_id, qty, amount, dt) values
(1, 4368, 41, 100, 10000.00, '2024-01-31'),
(2, 4365, 41, 50, 7500.00, '2024-01-31'),
(3, 4619, 41, 70, 14000.00, '2024-02-29');

create table src_personnel (
    id integer primary key,
    person_id integer,
    doc_id integer,
    amount numeric(12,2),
    dt date
);
insert into src_personnel (id, person_id, doc_id, amount, dt) values
(1, 897, 3001, 1000.00, '2024-01-10'),
(2, 898, 3002, 1500.00, '2024-02-11'),
(3, 897, 3003, 1200.00, '2024-03-12');
