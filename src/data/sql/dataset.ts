import type { TeachTable } from '../../types/curriculum'

/**
 * One small shop's orders, used across the early SQL units so a beginner meets
 * ONE table and gets to know it. Eight rows is small enough to hold in your head
 * and big enough to filter, sort and de-duplicate meaningfully.
 *
 * Deliberate features: a repeated customer (Ada, Bilal, Cara), repeated items,
 * ties on price, NULL coupons, and three statuses.
 */
export const ORDERS_SCHEMA =
  'CREATE TABLE orders (id INT, customer TEXT, item TEXT, price INT, qty INT, status TEXT, coupon TEXT);'

export const ORDERS_SEED =
  "INSERT INTO orders VALUES " +
  "(1,'Ada','Notebook',300,2,'shipped',NULL)," +
  "(2,'Bilal','Pen',50,10,'shipped','SAVE10')," +
  "(3,'Cara','Backpack',1800,1,'pending',NULL)," +
  "(4,'Dev','Notebook',300,1,'cancelled','SAVE10')," +
  "(5,'Ada','Desk Lamp',1200,1,'shipped',NULL)," +
  "(6,'Esha','Pen',50,5,'pending','WELCOME')," +
  "(7,'Bilal','Backpack',1800,1,'shipped',NULL)," +
  "(8,'Cara','Pen',50,3,'shipped','SAVE10');"

export const ORDERS_COLUMNS = ['id', 'customer', 'item', 'price', 'qty', 'status', 'coupon']

export const ORDERS_ROWS: (string | number | null)[][] = [
  [1, 'Ada', 'Notebook', 300, 2, 'shipped', null],
  [2, 'Bilal', 'Pen', 50, 10, 'shipped', 'SAVE10'],
  [3, 'Cara', 'Backpack', 1800, 1, 'pending', null],
  [4, 'Dev', 'Notebook', 300, 1, 'cancelled', 'SAVE10'],
  [5, 'Ada', 'Desk Lamp', 1200, 1, 'shipped', null],
  [6, 'Esha', 'Pen', 50, 5, 'pending', 'WELCOME'],
  [7, 'Bilal', 'Backpack', 1800, 1, 'shipped', null],
  [8, 'Cara', 'Pen', 50, 3, 'shipped', 'SAVE10'],
]

export const ORDERS_TABLE: TeachTable = {
  name: 'orders',
  columns: ORDERS_COLUMNS,
  rows: ORDERS_ROWS,
}
