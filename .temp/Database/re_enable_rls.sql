-- Re-enable RLS after bulk data import is complete
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
