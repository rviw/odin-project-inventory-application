#! /usr/bin/env node

require("dotenv").config();

const { Client } = require("pg");

const SQL = `
BEGIN;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR ( 40 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR ( 40 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR ( 255 ) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
  isbn VARCHAR(13) NOT NULL UNIQUE CHECK (isbn ~ '^[0-9]{13}$'),
  category_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  CONSTRAINT fk_books_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_books_author
    FOREIGN KEY (author_id)
    REFERENCES authors(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);

TRUNCATE TABLE books, authors, categories RESTART IDENTITY CASCADE;

INSERT INTO categories (name) 
VALUES
  ('Kids'),
  ('Fiction'),
  ('Nonfiction');

INSERT INTO authors (name) 
VALUES
  ('Roald Dahl'),
  ('E. B. White'),
  ('Virginia Evans'),
  ('Andy Weir'),
  ('Robert M. Sapolsky'),
  ('Gabor Maté');

INSERT INTO books (
  title,
  description,
  price,
  stock_quantity,
  isbn,
  category_id,
  author_id
) 
VALUES
  (
    'Charlie and the Chocolate Factory',
    'Willy Wonka''s famous chocolate factory is opening at last!',
    8.99,
    5,
    '9780593349663',
    (SELECT id FROM categories WHERE name = 'Kids'),
    (SELECT id FROM authors WHERE name = 'Roald Dahl')
  ),
  (
    'Matilda',
    'Matilda is a brilliant child with a magical mind.',
    7.99,
    10,
    '9780241558317',
    (SELECT id FROM categories WHERE name = 'Kids'),
    (SELECT id FROM authors WHERE name = 'Roald Dahl')
  ),
  (
    'Charlotte''s Web',
    'Some Pig. Humble. Radiant.',
    8.99,
    12,
    '9780062406781',
    (SELECT id FROM categories WHERE name = 'Kids'),
    (SELECT id FROM authors WHERE name = 'E. B. White')
  ),
  (
    'The Correspondent',
    'Every morning, Sybil Van Antwerp sits down to write letters.',
    28.00,
    29,
    '9780593798430',
    (SELECT id FROM categories WHERE name = 'Fiction'),
    (SELECT id FROM authors WHERE name = 'Virginia Evans')
  ),
  (
    'Project Hail Mary',
    'Ryland Grace is the sole survivor on a desperate, last-chance mission.',
    22.00,
    1,
    '9798217299461',
    (SELECT id FROM categories WHERE name = 'Fiction'),
    (SELECT id FROM authors WHERE name = 'Andy Weir')
  ),
  (
    'Behave',
    'The Biology of Humans at Our Best and Worst',
    22.00,
    10,
    '9780143110910',
    (SELECT id FROM categories WHERE name = 'Nonfiction'),
    (SELECT id FROM authors WHERE name = 'Robert M. Sapolsky')
  ),
  (
    'The Myth of Normal',
    'Trauma, Illness, and Healing in a Toxic Culture',
    32.00,
    3,
    '9780593083888',
    (SELECT id FROM categories WHERE name = 'Nonfiction'),
    (SELECT id FROM authors WHERE name = 'Gabor Maté')
  ),
  (
    'When the Body Says No',
    'The Cost of Hidden Stress',
    14.72,
    2,
    '9781785042225',
    (SELECT id FROM categories WHERE name = 'Nonfiction'),
    (SELECT id FROM authors WHERE name = 'Gabor Maté')
  );

COMMIT;
`;

async function main() {
  console.log("seeding...");

  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("done");
}

main();
