-- supabase/migrations/0012_skill_verification.sql
-- Phase 3: AI Skill Verification Engine schema + seed

-- ====================================================================
-- 1. MCQ Questions table
-- Static bank — seeded here, read-only at runtime via service_role.
-- ====================================================================
create table if not exists public.mcq_questions (
  id            uuid    primary key default gen_random_uuid(),
  skill         text    not null,
  question      text    not null,
  options       jsonb   not null,           -- string[]
  correct_answer text   not null,           -- must exactly match one option string
  difficulty    text    not null check (difficulty in ('easy', 'medium', 'hard')),
  created_at    timestamptz not null default now()
);

-- ====================================================================
-- 2. Skill Verifications table
-- One row per (candidate_id, skill) — upserted on each run.
-- ====================================================================
create table if not exists public.skill_verifications (
  id                   uuid    primary key default gen_random_uuid(),
  candidate_id         uuid    not null,
  skill                text    not null,
  mcq_score            integer not null,
  free_response_score  integer not null,
  repo_quality_score   integer not null,
  weighted_score       integer not null,
  verified             boolean not null,
  evidence             jsonb   not null default '[]'::jsonb,
  created_at           timestamptz not null default now(),
  unique (candidate_id, skill)
);

-- ====================================================================
-- 3. Enable RLS — no client policies; service_role only.
-- ====================================================================
alter table public.mcq_questions     enable row level security;
alter table public.skill_verifications enable row level security;

-- ====================================================================
-- 4. Seed MCQ Questions
-- 6 questions × 4 skills = 24 rows
-- correct_answer is the EXACT option string the engine will compare against.
-- ====================================================================

-- REACT --
insert into public.mcq_questions (skill, question, options, correct_answer, difficulty) values

('React',
 'What is the primary purpose of the key prop in React lists?',
 '["A. To apply CSS styles to list items",
   "B. To help React identify which items have changed, been added, or removed",
   "C. To pass data from parent to child components",
   "D. To trigger re-renders on list updates"]'::jsonb,
 'B. To help React identify which items have changed, been added, or removed',
 'easy'),

('React',
 'Which hook should you use to perform a side effect (e.g., data fetching) after a component renders?',
 '["A. useState",
   "B. useRef",
   "C. useEffect",
   "D. useMemo"]'::jsonb,
 'C. useEffect',
 'easy'),

('React',
 'What does React.memo do?',
 '["A. Memoizes the return value of an expensive calculation",
   "B. Prevents a component from re-rendering if its props have not changed",
   "C. Caches the results of network requests",
   "D. Saves component state across page refreshes"]'::jsonb,
 'B. Prevents a component from re-rendering if its props have not changed',
 'medium'),

('React',
 'In React, what triggers a component to re-render?',
 '["A. Only changes to DOM attributes",
   "B. A change in state or props, or a parent re-render",
   "C. Only direct calls to setState",
   "D. Changes to any JavaScript variable in scope"]'::jsonb,
 'B. A change in state or props, or a parent re-render',
 'medium'),

('React',
 'Which of the following correctly describes how the useCallback hook works?',
 '["A. It runs a callback function after every render",
   "B. It returns a memoized version of a callback that only changes if one of the dependencies changes",
   "C. It replaces useState for managing callback-based state",
   "D. It prevents child components from accessing the parent callback"]'::jsonb,
 'B. It returns a memoized version of a callback that only changes if one of the dependencies changes',
 'medium'),

('React',
 'What is the correct way to update state that depends on the previous state value?',
 '["A. setState(state + 1)",
   "B. setState(prevState => prevState + 1)",
   "C. state = state + 1",
   "D. useEffect(() => setState(state + 1), [state])"]'::jsonb,
 'B. setState(prevState => prevState + 1)',
 'hard');

-- PYTHON --
insert into public.mcq_questions (skill, question, options, correct_answer, difficulty) values

('Python',
 'What is the output of: list(range(2, 10, 3))?',
 '["A. [2, 5, 8]",
   "B. [2, 4, 6, 8]",
   "C. [3, 6, 9]",
   "D. [2, 5, 8, 11]"]'::jsonb,
 'A. [2, 5, 8]',
 'easy'),

('Python',
 'Which of the following creates a generator in Python?',
 '["A. def gen(): return [x for x in range(10)]",
   "B. def gen(): yield from range(10)",
   "C. gen = list(range(10))",
   "D. gen = (range(10))"]'::jsonb,
 'B. def gen(): yield from range(10)',
 'easy'),

('Python',
 'What does the @staticmethod decorator do?',
 '["A. Marks a method that can only be called once",
   "B. Defines a method that belongs to the class, not an instance, and does not receive cls or self",
   "C. Caches the result of a method call",
   "D. Makes a method thread-safe"]'::jsonb,
 'B. Defines a method that belongs to the class, not an instance, and does not receive cls or self',
 'medium'),

('Python',
 'What is the difference between deepcopy and shallow copy?',
 '["A. deepcopy copies only primitive values; shallow copy copies everything",
   "B. shallow copy creates a new object but references the same nested objects; deepcopy recursively copies all nested objects",
   "C. They are identical for all Python data types",
   "D. deepcopy only works on lists; shallow copy works on all types"]'::jsonb,
 'B. shallow copy creates a new object but references the same nested objects; deepcopy recursively copies all nested objects',
 'medium'),

('Python',
 'Which of the following is a valid use of Python decorators?',
 '["A. To delete a function after it has been called",
   "B. To wrap a function and modify its behavior without changing its source code",
   "C. To compile Python to bytecode before execution",
   "D. To create abstract base classes"]'::jsonb,
 'B. To wrap a function and modify its behavior without changing its source code',
 'medium'),

('Python',
 'What does the GIL (Global Interpreter Lock) prevent in CPython?',
 '["A. Multiple threads from running Python bytecode simultaneously",
   "B. Multiple processes from sharing memory",
   "C. Coroutines from running concurrently",
   "D. Generator functions from being used in async code"]'::jsonb,
 'A. Multiple threads from running Python bytecode simultaneously',
 'hard');

-- SQL --
insert into public.mcq_questions (skill, question, options, correct_answer, difficulty) values

('SQL',
 'What is the difference between WHERE and HAVING in SQL?',
 '["A. WHERE filters rows after grouping; HAVING filters rows before grouping",
   "B. WHERE filters rows before grouping; HAVING filters groups after aggregation",
   "C. They are interchangeable and produce the same results",
   "D. HAVING is only used with JOIN clauses"]'::jsonb,
 'B. WHERE filters rows before grouping; HAVING filters groups after aggregation',
 'easy'),

('SQL',
 'Which JOIN type returns all rows from the left table and matched rows from the right table (NULL for no match)?',
 '["A. INNER JOIN",
   "B. CROSS JOIN",
   "C. LEFT JOIN",
   "D. RIGHT JOIN"]'::jsonb,
 'C. LEFT JOIN',
 'easy'),

('SQL',
 'What does the DISTINCT keyword do in a SELECT statement?',
 '["A. Eliminates duplicate rows from the result set",
   "B. Selects only NULL values",
   "C. Sorts the result set in ascending order",
   "D. Returns only the first row of each group"]'::jsonb,
 'A. Eliminates duplicate rows from the result set',
 'easy'),

('SQL',
 'Which of the following is an advantage of using an index on a table column?',
 '["A. It reduces the storage space needed for the table",
   "B. It speeds up SELECT queries that filter or sort by the indexed column, at the cost of slower writes",
   "C. It enforces uniqueness on the column automatically",
   "D. It prevents NULL values from being inserted"]'::jsonb,
 'B. It speeds up SELECT queries that filter or sort by the indexed column, at the cost of slower writes',
 'medium'),

('SQL',
 'What is a correlated subquery?',
 '["A. A subquery that runs only once and its result is used by the outer query",
   "B. A subquery that references a column from the outer query and is re-evaluated for each row",
   "C. A subquery that always returns a single value",
   "D. A subquery placed in the FROM clause"]'::jsonb,
 'B. A subquery that references a column from the outer query and is re-evaluated for each row',
 'hard'),

('SQL',
 'Which isolation level prevents dirty reads but still allows non-repeatable reads?',
 '["A. SERIALIZABLE",
   "B. READ UNCOMMITTED",
   "C. REPEATABLE READ",
   "D. READ COMMITTED"]'::jsonb,
 'D. READ COMMITTED',
 'hard');

-- TYPESCRIPT --
insert into public.mcq_questions (skill, question, options, correct_answer, difficulty) values

('TypeScript',
 'What is the difference between interface and type in TypeScript?',
 '["A. interface can only describe objects; type can describe any shape including unions and primitives",
   "B. type is always compiled away; interface is kept at runtime",
   "C. interface supports generics; type does not",
   "D. They are completely identical with no functional difference"]'::jsonb,
 'A. interface can only describe objects; type can describe any shape including unions and primitives',
 'medium'),

('TypeScript',
 'What does the unknown type represent in TypeScript?',
 '["A. A type that can hold any value but requires a type check before use",
   "B. A type that is identical to any",
   "C. A type for variables that have not been declared",
   "D. A type that represents undefined or null"]'::jsonb,
 'A. A type that can hold any value but requires a type check before use',
 'medium'),

('TypeScript',
 'What is a TypeScript generic?',
 '["A. A built-in type for arrays and maps",
   "B. A placeholder type that allows a function, class, or interface to work with multiple types while remaining type-safe",
   "C. A decorator that adds type information at runtime",
   "D. A way to declare global variables with types"]'::jsonb,
 'B. A placeholder type that allows a function, class, or interface to work with multiple types while remaining type-safe',
 'medium'),

('TypeScript',
 'What does the readonly modifier do on a class property?',
 '["A. Makes the property accessible only within the class",
   "B. Prevents the property from being assigned after its initial declaration or constructor",
   "C. Makes the property non-enumerable",
   "D. Removes the property from the compiled JavaScript output"]'::jsonb,
 'B. Prevents the property from being assigned after its initial declaration or constructor',
 'easy'),

('TypeScript',
 'Which TypeScript utility type makes all properties of a type optional?',
 '["A. Required<T>",
   "B. Omit<T, K>",
   "C. Partial<T>",
   "D. Readonly<T>"]'::jsonb,
 'C. Partial<T>',
 'easy'),

('TypeScript',
 'What is the never type used for in TypeScript?',
 '["A. To represent a value that is always undefined",
   "B. To represent values that can never occur, such as a function that always throws or an exhaustive switch case",
   "C. To opt out of type checking for a specific value",
   "D. To mark a type as deprecated"]'::jsonb,
 'B. To represent values that can never occur, such as a function that always throws or an exhaustive switch case',
 'hard');

-- ====================================================================
-- 5. Populate github_data for the test candidate
-- Required so the React/TypeScript/Python pass cases can compute a
-- real repo_quality_score.  SQL has no matching repos → score stays 0.
-- ====================================================================
update public.candidate_profiles
set github_data = '{
  "repositories": [
    {
      "name": "next-ai-recruiter",
      "description": "AI candidate scoring and vector matching engine",
      "primary_language": "TypeScript",
      "stars": 12,
      "is_fork": false
    },
    {
      "name": "react-dashboard-ui",
      "description": "Component library and dashboard built with React",
      "primary_language": "TypeScript",
      "stars": 8,
      "is_fork": false
    },
    {
      "name": "supabase-rls-helper",
      "description": "Utilities for Supabase Row Level Security policies",
      "primary_language": "TypeScript",
      "stars": 6,
      "is_fork": false
    },
    {
      "name": "py-ml-pipeline",
      "description": "Python ML data pipeline with scikit-learn",
      "primary_language": "Python",
      "stars": 5,
      "is_fork": false
    },
    {
      "name": "ts-fork-experiment",
      "description": "Forked TypeScript experiment",
      "primary_language": "TypeScript",
      "stars": 0,
      "is_fork": true
    }
  ],
  "languages": { "TypeScript": 0.72, "Python": 0.23, "Shell": 0.05 },
  "commits": {
    "total_last_12_months": 163,
    "by_repository": {
      "next-ai-recruiter": 82,
      "react-dashboard-ui": 48,
      "supabase-rls-helper": 20,
      "py-ml-pipeline": 13
    },
    "active_months": [
      "2025-01","2025-02","2025-03","2025-04","2025-05",
      "2025-06","2025-07","2025-08","2025-09","2025-10"
    ]
  },
  "pull_requests": { "opened": 31, "merged": 24 },
  "top_5_repos_by_stars": [
    { "name": "next-ai-recruiter",  "stars": 12 },
    { "name": "react-dashboard-ui", "stars": 8  },
    { "name": "supabase-rls-helper","stars": 6  },
    { "name": "py-ml-pipeline",     "stars": 5  }
  ]
}'::jsonb
where user_id = '0ee73e0e-0529-4480-a16c-15748a277bde';
