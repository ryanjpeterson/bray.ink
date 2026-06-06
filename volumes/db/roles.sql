-- Set passwords for Supabase internal roles.
-- Uses the POSTGRES_PASSWORD env var via psql's \set meta-command.
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator          WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin    WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_replication_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_read_only_user WITH PASSWORD :'pgpass';
