export interface MCQQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MOCK_MCQ_QUESTIONS: MCQQuestion[] = [
  // React
  {
    id: "mcq-react-1",
    skill: "React",
    question: "What is the primary purpose of the key prop in React lists?",
    options: [
      "A. To apply CSS styles to list items",
      "B. To help React identify which items have changed, been added, or removed",
      "C. To pass data from parent to child components",
      "D. To trigger re-renders on list updates"
    ],
    correct_answer: "B. To help React identify which items have changed, been added, or removed",
    difficulty: "easy"
  },
  {
    id: "mcq-react-2",
    skill: "React",
    question: "Which hook should you use to perform a side effect (e.g., data fetching) after a component renders?",
    options: ["A. useState", "B. useRef", "C. useEffect", "D. useMemo"],
    correct_answer: "C. useEffect",
    difficulty: "easy"
  },
  {
    id: "mcq-react-3",
    skill: "React",
    question: "What does React.memo do?",
    options: [
      "A. Memoizes the return value of an expensive calculation",
      "B. Prevents a component from re-rendering if its props have not changed",
      "C. Caches the results of network requests",
      "D. Saves component state across page refreshes"
    ],
    correct_answer: "B. Prevents a component from re-rendering if its props have not changed",
    difficulty: "medium"
  },
  {
    id: "mcq-react-4",
    skill: "React",
    question: "In React, what triggers a component to re-render?",
    options: [
      "A. Only changes to DOM attributes",
      "B. A change in state or props, or a parent re-render",
      "C. Only direct calls to setState",
      "D. Changes to any JavaScript variable in scope"
    ],
    correct_answer: "B. A change in state or props, or a parent re-render",
    difficulty: "medium"
  },
  {
    id: "mcq-react-5",
    skill: "React",
    question: "Which of the following correctly describes how the useCallback hook works?",
    options: [
      "A. It runs a callback function after every render",
      "B. It returns a memoized version of a callback that only changes if one of the dependencies changes",
      "C. It replaces useState for managing callback-based state",
      "D. It prevents child components from accessing the parent callback"
    ],
    correct_answer: "B. It returns a memoized version of a callback that only changes if one of the dependencies changes",
    difficulty: "medium"
  },
  {
    id: "mcq-react-6",
    skill: "React",
    question: "What is the correct way to update state that depends on the previous state value?",
    options: [
      "A. setState(state + 1)",
      "B. setState(prevState => prevState + 1)",
      "C. state = state + 1",
      "D. setState(state => { state.val = state.val + 1; return state; })"
    ],
    correct_answer: "B. setState(prevState => prevState + 1)",
    difficulty: "easy"
  },
  // Python
  {
    id: "mcq-py-1",
    skill: "Python",
    question: "What is the output of: list(range(2, 10, 3))?",
    options: ["A. [2, 5, 8]", "B. [2, 4, 6, 8]", "C. [3, 6, 9]", "D. [2, 5, 8, 11]"],
    correct_answer: "A. [2, 5, 8]",
    difficulty: "easy"
  },
  {
    id: "mcq-py-2",
    skill: "Python",
    question: "Which of the following creates a generator in Python?",
    options: [
      "A. def gen(): return [x for x in range(10)]",
      "B. def gen(): yield from range(10)",
      "C. gen = list(range(10))",
      "D. gen = (range(10))"
    ],
    correct_answer: "B. def gen(): yield from range(10)",
    difficulty: "easy"
  },
  {
    id: "mcq-py-3",
    skill: "Python",
    question: "What does the @staticmethod decorator do?",
    options: [
      "A. Marks a method that can only be called once",
      "B. Defines a method that belongs to the class, not an instance, and does not receive cls or self",
      "C. Caches the result of a method call",
      "D. Makes a method thread-safe"
    ],
    correct_answer: "B. Defines a method that belongs to the class, not an instance, and does not receive cls or self",
    difficulty: "medium"
  },
  {
    id: "mcq-py-4",
    skill: "Python",
    question: "What is the difference between deepcopy and shallow copy?",
    options: [
      "A. deepcopy copies only primitive values; shallow copy copies everything",
      "B. shallow copy creates a new object but references the same nested objects; deepcopy recursively copies all nested objects",
      "C. They are identical for all Python data types",
      "D. deepcopy only works on lists; shallow copy works on all types"
    ],
    correct_answer: "B. shallow copy creates a new object but references the same nested objects; deepcopy recursively copies all nested objects",
    difficulty: "medium"
  },
  {
    id: "mcq-py-5",
    skill: "Python",
    question: "Which of the following is a valid use of Python decorators?",
    options: [
      "A. To delete a function after it has been called",
      "B. To wrap a function and modify its behavior without changing its source code",
      "C. To compile Python to bytecode before execution",
      "D. To create abstract base classes"
    ],
    correct_answer: "B. To wrap a function and modify its behavior without changing its source code",
    difficulty: "medium"
  },
  {
    id: "mcq-py-6",
    skill: "Python",
    question: "What does the GIL (Global Interpreter Lock) prevent in CPython?",
    options: [
      "A. Multiple threads from running Python bytecode simultaneously",
      "B. Multiple processes from sharing memory",
      "C. Coroutines from running concurrently",
      "D. Generator functions from being used in async code"
    ],
    correct_answer: "A. Multiple threads from running Python bytecode simultaneously",
    difficulty: "hard"
  },
  // SQL
  {
    id: "mcq-sql-1",
    skill: "SQL",
    question: "What is the difference between WHERE and HAVING in SQL?",
    options: [
      "A. WHERE filters rows after grouping; HAVING filters rows before grouping",
      "B. WHERE filters rows before grouping; HAVING filters groups after aggregation",
      "C. They are interchangeable and produce the same results",
      "D. HAVING is only used with JOIN clauses"
    ],
    correct_answer: "B. WHERE filters rows before grouping; HAVING filters groups after aggregation",
    difficulty: "easy"
  },
  {
    id: "mcq-sql-2",
    skill: "SQL",
    question: "Which JOIN type returns all rows from the left table and matched rows from the right table (NULL for no match)?",
    options: ["A. INNER JOIN", "B. CROSS JOIN", "C. LEFT JOIN", "D. RIGHT JOIN"],
    correct_answer: "C. LEFT JOIN",
    difficulty: "easy"
  },
  {
    id: "mcq-sql-3",
    skill: "SQL",
    question: "What does the DISTINCT keyword do in a SELECT statement?",
    options: [
      "A. Eliminates duplicate rows from the result set",
      "B. Selects only NULL values",
      "C. Sorts the result set in ascending order",
      "D. Returns only the first row of each group"
    ],
    correct_answer: "A. Eliminates duplicate rows from the result set",
    difficulty: "easy"
  },
  {
    id: "mcq-sql-4",
    skill: "SQL",
    question: "Which of the following is an advantage of using an index on a table column?",
    options: [
      "A. It reduces the storage space needed for the table",
      "B. It speeds up SELECT queries that filter or sort by the indexed column, at the cost of slower writes",
      "C. It enforces uniqueness on the column automatically",
      "D. It prevents NULL values from being inserted"
    ],
    correct_answer: "B. It speeds up SELECT queries that filter or sort by the indexed column, at the cost of slower writes",
    difficulty: "medium"
  },
  {
    id: "mcq-sql-5",
    skill: "SQL",
    question: "What is a correlated subquery?",
    options: [
      "A. A subquery that runs only once and its result is used by the outer query",
      "B. A subquery that references a column from the outer query and is re-evaluated for each row",
      "C. A subquery that always returns a single value",
      "D. A subquery placed in the FROM clause"
    ],
    correct_answer: "B. A subquery that references a column from the outer query and is re-evaluated for each row",
    difficulty: "hard"
  },
  {
    id: "mcq-sql-6",
    skill: "SQL",
    question: "Which isolation level prevents dirty reads but still allows non-repeatable reads?",
    options: ["A. SERIALIZABLE", "B. READ UNCOMMITTED", "C. REPEATABLE READ", "D. READ COMMITTED"],
    correct_answer: "D. READ COMMITTED",
    difficulty: "hard"
  },
  // TypeScript
  {
    id: "mcq-ts-1",
    skill: "TypeScript",
    question: "What is the difference between interface and type in TypeScript?",
    options: [
      "A. interface can only describe objects; type can describe any shape including unions and primitives",
      "B. type is always compiled away; interface is kept at runtime",
      "C. interface supports generics; type does not",
      "D. They are completely identical with no functional difference"
    ],
    correct_answer: "A. interface can only describe objects; type can describe any shape including unions and primitives",
    difficulty: "medium"
  },
  {
    id: "mcq-ts-2",
    skill: "TypeScript",
    question: "What does the unknown type represent in TypeScript?",
    options: [
      "A. A type that can hold any value but requires a type check before use",
      "B. A type that is identical to any",
      "C. A type for variables that have not been declared",
      "D. A type that represents undefined or null"
    ],
    correct_answer: "A. A type that can hold any value but requires a type check before use",
    difficulty: "medium"
  },
  {
    id: "mcq-ts-3",
    skill: "TypeScript",
    question: "What is a TypeScript generic?",
    options: [
      "A. A built-in type for arrays and maps",
      "B. A placeholder type that allows a function, class, or interface to work with multiple types while remaining type-safe",
      "C. A decorator that adds type information at runtime",
      "D. A way to declare global variables with types"
    ],
    correct_answer: "B. A placeholder type that allows a function, class, or interface to work with multiple types while remaining type-safe",
    difficulty: "medium"
  },
  {
    id: "mcq-ts-4",
    skill: "TypeScript",
    question: "What does the readonly modifier do on a class property?",
    options: [
      "A. Makes the property accessible only within the class",
      "B. Prevents the property from being assigned after its initial declaration or constructor",
      "C. Makes the property non-enumerable",
      "D. Removes the property from the compiled JavaScript output"
    ],
    correct_answer: "B. Prevents the property from being assigned after its initial declaration or constructor",
    difficulty: "easy"
  },
  {
    id: "mcq-ts-5",
    skill: "TypeScript",
    question: "Which TypeScript utility type makes all properties of a type optional?",
    options: ["A. Required<T>", "B. Omit<T, K>", "C. Partial<T>", "D. Readonly<T>"],
    correct_answer: "C. Partial<T>",
    difficulty: "easy"
  },
  {
    id: "mcq-ts-6",
    skill: "TypeScript",
    question: "What is the never type used for in TypeScript?",
    options: [
      "A. To represent a value that is always undefined",
      "B. To represent values that can never occur, such as a function that always throws or an exhaustive switch case",
      "C. To opt out of type checking for a specific value",
      "D. To mark a type as deprecated"
    ],
    correct_answer: "B. To represent values that can never occur, such as a function that always throws or an exhaustive switch case",
    difficulty: "hard"
  }
];
