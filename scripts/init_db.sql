DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS memes CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TYPE IF EXISTS privacy_level;
DROP TYPE IF EXISTS friend_status;

CREATE TABLE users (
    id serial PRIMARY KEY,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    email VARCHAR(64) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp
);

CREATE TABLE attachments (
    id serial PRIMARY KEY,
    filepath text NOT NULL,
    filesize integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp
);

CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private');
CREATE TABLE memes (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id),
    description text NOT NULL,
    attachment_id integer NOT NULL REFERENCES attachments(id),
    privacy_level privacy_level NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp
);

CREATE TYPE friend_status AS ENUM ('waiting', 'request', 'declined', 'accepted');
CREATE TABLE friends (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id),
    friend_id integer NOT NULL REFERENCES users(id),
    status friend_status NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp,
    CONSTRAINT friends_unique UNIQUE (user_id, friend_id)
);
