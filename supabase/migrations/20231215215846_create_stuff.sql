create table
things (
	id bigint primary key generated always as identity,
	name text,
	data text,
	created_at timestamptz default now()
);
