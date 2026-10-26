// Math problem generator tailored for Finnish Elementary School (grades 1-2)

/**
 * Supported operations: 'addition', 'subtraction', 'combo', 'multiplication', 'division'
 */

export const OPERATION_CONFIG = {
  addition: {
    id: 'addition',
    symbol: '+',
    nameFi: 'Yhteenlasku (+)',
    nameEn: 'Addition (+)',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    icon: '➕',
  },
  subtraction: {
    id: 'subtraction',
    symbol: '−',
    nameFi: 'Vähennyslasku (−)',
    nameEn: 'Subtraction (−)',
    color: 'bg-amber-500 hover:bg-amber-600',
    lightColor: 'bg-amber-50 text-amber-800 border-amber-300',
    badgeColor: 'bg-amber-100 text-amber-700',
    icon: '➖',
  },
  combo: {
    id: 'combo',
    symbol: '+/−',
    nameFi: 'Yhdistelmä (+ ja −)',
    nameEn: 'Combo (+ and −)',
    color: 'bg-pink-500 hover:bg-pink-600',
    lightColor: 'bg-pink-50 text-pink-800 border-pink-300',
    badgeColor: 'bg-pink-100 text-pink-700',
    icon: '🔀',
  },
  multiplication: {
    id: 'multiplication',
    symbol: '×',
    nameFi: 'Kertolasku (×)',
    nameEn: 'Multiplication (×)',
    color: 'bg-blue-500 hover:bg-blue-600',
    lightColor: 'bg-blue-50 text-blue-800 border-blue-300',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: '✖️',
  },
  division: {
    id: 'division',
    symbol: '÷',
    nameFi: 'Jakolasku (÷)',
    nameEn: 'Division (÷)',
    color: 'bg-purple-500 hover:bg-purple-600',
    lightColor: 'bg-purple-50 text-purple-800 border-purple-300',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: '➗',
  },
};

function randomInt(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

/**
 * Generate a single question based on configuration
 */
export function generateQuestion(config) {
  const {
    operations = ['addition'],
    maxNumber = 20, // default range 0-20 (Finnish 1st grade spring)
    minNumber = 0,
    allowGreaterThan10 = false,
    minOperandOver10 = false,
    maxFactor = 10, // for multiplication/division when allowGreaterThan10 is enabled
    tableStart = 2, // multiplication table start
    tableEnd = 5,   // multiplication table end
    specificTables = [], // optional explicit list [2, 3, 5]
  } = config;

  // Pick an operation randomly from chosen operations
  const op = operations[Math.floor(Math.random() * operations.length)] || 'addition';

  let num1 = 0;
  let num2 = 0;
  let num3 = null;
  let answer = 0;
  let symbol = '+';
  let symbol2 = null;

  const effectiveMax = allowGreaterThan10 ? Math.max(25, maxNumber) : maxNumber;

  if (op === 'addition') {
    symbol = '+';
    if (allowGreaterThan10) {
      if (minOperandOver10 && effectiveMax >= 24) {
        // Both operands > 10
        const maxA = Math.max(11, effectiveMax - 11);
        num1 = randomInt(11, maxA);
        num2 = randomInt(11, Math.max(11, effectiveMax - num1));
        answer = num1 + num2;
      } else {
        // Ensure sum > 10 and at least one number can be > 10
        const sum = randomInt(11, effectiveMax);
        num1 = randomInt(1, sum - 1);
        num2 = sum - num1;
        answer = sum;
      }
    } else {
      const totalMax = Math.max(minNumber + 1, effectiveMax);
      const sum = randomInt(minNumber, totalMax);
      num1 = randomInt(0, sum);
      num2 = sum - num1;
      answer = sum;
    }
  } else if (op === 'subtraction') {
    symbol = '−';
    if (allowGreaterThan10) {
      if (minOperandOver10 && effectiveMax >= 22) {
        num1 = randomInt(12, effectiveMax);
        num2 = randomInt(11, num1);
        answer = num1 - num2;
      } else {
        num1 = randomInt(11, effectiveMax);
        num2 = randomInt(1, num1);
        answer = num1 - num2;
      }
    } else {
      const upper = Math.max(minNumber + 1, effectiveMax);
      num1 = randomInt(minNumber, upper);
      num2 = randomInt(0, num1); // num2 <= num1 guarantees answer >= 0
      answer = num1 - num2;
    }
  } else if (op === 'combo') {
    // 3-number combination of addition and subtraction, e.g. 2 + 3 - 5 or 8 - 3 + 4
    const pattern = Math.random() > 0.35 ? 'add_sub' : 'sub_add';
    const minVal = allowGreaterThan10 && minOperandOver10 && effectiveMax >= 35 ? 11 : 1;

    if (pattern === 'add_sub') {
      // num1 + num2 − num3
      symbol = '+';
      symbol2 = '−';
      const minSum = allowGreaterThan10 ? Math.max(12, minVal * 2) : 2;
      const maxSum = Math.max(minSum, effectiveMax);
      const intermediateSum = randomInt(minSum, maxSum);

      num1 = randomInt(minVal, Math.max(minVal, intermediateSum - minVal));
      num2 = intermediateSum - num1;
      // Subtract num3 such that result >= 0 (allows e.g. 2 + 3 - 5 = 0)
      num3 = randomInt(minVal, intermediateSum);
      answer = intermediateSum - num3;
    } else {
      // num1 − num2 + num3 (ensure num1 - num2 >= 0 so intermediate step is never negative!)
      symbol = '−';
      symbol2 = '+';
      const minStart = allowGreaterThan10 ? Math.max(11, minVal + 2) : 2;
      num1 = randomInt(minStart, Math.max(minStart, effectiveMax));
      num2 = randomInt(minVal, num1);
      const intermediateDiff = num1 - num2;
      const maxAdd = Math.max(minVal, effectiveMax - intermediateDiff);
      num3 = randomInt(minVal, maxAdd);
      answer = intermediateDiff + num3;
    }
  } else if (op === 'multiplication') {
    symbol = '×';
    let table = tableStart;
    if (specificTables && specificTables.length > 0) {
      table = specificTables[Math.floor(Math.random() * specificTables.length)];
    } else {
      const minT = Math.min(tableStart, tableEnd);
      const maxT = Math.max(tableStart, tableEnd);
      table = randomInt(minT, maxT);
    }

    const factorUpper = allowGreaterThan10 ? Math.max(12, maxFactor || 20) : 10;
    const factorLower = allowGreaterThan10 && minOperandOver10 ? 11 : 1;
    const multiplier = randomInt(factorLower, factorUpper);

    if (Math.random() > 0.5) {
      num1 = table;
      num2 = multiplier;
    } else {
      num1 = multiplier;
      num2 = table;
    }
    answer = num1 * num2;
  } else if (op === 'division') {
    symbol = '÷';
    // Exact integer division without remainders
    let divisor = tableStart;
    if (specificTables && specificTables.length > 0) {
      divisor = specificTables[Math.floor(Math.random() * specificTables.length)];
    } else {
      const minT = Math.max(1, Math.min(tableStart, tableEnd));
      const maxT = Math.max(minT, tableEnd);
      divisor = randomInt(minT, maxT);
    }

    const quotientUpper = allowGreaterThan10 ? Math.max(12, maxFactor || 20) : 10;
    const quotientLower = allowGreaterThan10 && minOperandOver10 ? 11 : 1;
    const quotient = randomInt(quotientLower, quotientUpper);
    const dividend = divisor * quotient;

    num1 = dividend;
    num2 = divisor;
    answer = quotient;
  }

  const displayString =
    num3 !== null && symbol2
      ? `${num1} ${symbol} ${num2} ${symbol2} ${num3}`
      : `${num1} ${symbol} ${num2}`;

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    operation: op,
    symbol,
    symbol2,
    num1,
    num2,
    num3,
    correctAnswer: answer,
    displayString,
  };
}

/**
 * Generate a complete test set of unique questions
 */
export function generateTestQuestions(config, count = 10) {
  const questions = [];
  const signatures = new Set();
  const maxAttempts = count * 8;
  let attempts = 0;

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    const q = generateQuestion(config);
    const sig = `${q.operation}:${q.displayString}`;

    // Avoid immediate duplicates when possible
    if (!signatures.has(sig) || attempts > count * 3) {
      signatures.add(sig);
      questions.push(q);
    }
  }

  // If still less than count, fill up
  while (questions.length < count) {
    questions.push(generateQuestion(config));
  }

  return questions;
}

/**
 * Check if the child's input matches the expected answer.
 * Handles Finnish comma separator (e.g. "4,0" === 4, "5" === 5)
 */
export function checkAnswer(userInput, expectedAnswer) {
  if (userInput === null || userInput === undefined || userInput.trim() === '') {
    return false;
  }
  // Replace Finnish comma with decimal point
  const normalized = userInput.toString().trim().replace(',', '.');
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) return false;
  // Account for floating point epsilon if ever decimals are generated
  return Math.abs(parsed - expectedAnswer) < 0.0001;
}
