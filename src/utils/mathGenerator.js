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
 * Format a numeric value using Finnish decimal comma (e.g. 2.5 -> "2,5")
 */
export function formatFinnishNumber(num) {
  if (num === null || num === undefined) return '';
  return num.toString().replace('.', ',');
}

/**
 * Generate a single question based on configuration
 */
export function generateQuestion(config) {
  const {
    operations = ['addition'],
    maxNumber = 20, // Max sum / outcome ceiling
    minNumber = 0,  // Min sum / outcome floor (always >= 0)
    allowGreaterThan10 = false,
    minSumLimit = 10, // When allowGreaterThan10 is active: minimum sum/largest number
    maxSumLimit = 30, // When allowGreaterThan10 is active: maximum sum/outcome limiter
    maxFactor = 10, // for multiplication/division when allowGreaterThan10 is enabled
    tableStart = 2, // multiplication table start
    tableEnd = 5,   // multiplication table end
    specificTables = [], // optional explicit list [2, 3, 5]
    // Division decimal options (default false -> integers only)
    allowDecimalsInDivision = false,
    divisionDecimalType = 'halves', // 'halves' (,5) | 'tenths' (1 decimal e.g. ,2 ,4 ,5 ,8)
    divisionDecimalsOnly = false, // true = only decimal answers, false = mix of integer & decimal
  } = config;

  // Pick an operation randomly from chosen operations
  const op = operations[Math.floor(Math.random() * operations.length)] || 'addition';

  let num1 = 0;
  let num2 = 0;
  let num3 = null;
  let answer = 0;
  let symbol = '+';
  let symbol2 = null;

  // Determine safe non-negative min and max outcome bounds for +, −, and combo
  const rawMin = allowGreaterThan10
    ? Math.max(0, parseInt(minSumLimit) || 0)
    : Math.max(0, parseInt(minNumber) || 0);
  const rawMax = allowGreaterThan10
    ? Math.max(11, parseInt(maxSumLimit) || maxNumber || 30)
    : Math.max(5, parseInt(maxNumber) || 20);

  const safeMinOutcome = Math.max(0, Math.min(rawMin, rawMax - 2));
  const safeMaxOutcome = Math.max(safeMinOutcome + 2, rawMax);

  if (op === 'addition') {
    symbol = '+';
    // Outcome (sum) is strictly bounded between [safeMinOutcome, safeMaxOutcome]
    const minTargetSum = allowGreaterThan10 ? Math.max(11, safeMinOutcome) : safeMinOutcome;
    const maxTargetSum = Math.max(minTargetSum, safeMaxOutcome);
    const sum = randomInt(minTargetSum, maxTargetSum);

    num1 = randomInt(0, sum);
    num2 = sum - num1;
    answer = sum;
  } else if (op === 'subtraction') {
    symbol = '−';
    // Minuend (starting number) is bounded by safeMaxOutcome so numbers never get too big,
    // and result (num1 - num2) is >= safeMinOutcome >= 0 (never negative!)
    const minStart = allowGreaterThan10 ? Math.max(11, safeMinOutcome + 1) : Math.max(1, safeMinOutcome);
    const maxStart = Math.max(minStart, safeMaxOutcome);
    num1 = randomInt(minStart, maxStart);

    // Ensure answer = num1 - num2 >= safeMinOutcome (and >= 0)
    const maxSubtrahend = Math.max(0, num1 - safeMinOutcome);
    num2 = randomInt(0, maxSubtrahend);
    answer = num1 - num2;
  } else if (op === 'combo') {
    // 3-number combination of addition and subtraction, e.g. 2 + 3 - 5 or 12 - 4 + 5
    // Both intermediate step AND final answer are strictly kept within [0, safeMaxOutcome]
    // and final answer is within [safeMinOutcome, safeMaxOutcome]
    const pattern = Math.random() > 0.4 ? 'add_sub' : 'sub_add';

    if (pattern === 'add_sub') {
      // num1 + num2 − num3
      symbol = '+';
      symbol2 = '−';
      const minInter = allowGreaterThan10 ? Math.max(11, safeMinOutcome + 1) : Math.max(2, safeMinOutcome + 1);
      const maxInter = Math.max(minInter, safeMaxOutcome);
      const intermediateSum = randomInt(minInter, maxInter);

      num1 = randomInt(1, intermediateSum - 1);
      num2 = intermediateSum - num1;

      // We want: safeMinOutcome <= intermediateSum - num3 <= safeMaxOutcome, with num3 >= 1
      const maxNum3 = Math.max(1, intermediateSum - safeMinOutcome);
      num3 = randomInt(1, maxNum3);
      answer = intermediateSum - num3;
    } else {
      // num1 − num2 + num3
      // Keep intermediate (num1 - num2) >= 0 so child never encounters negative numbers mid-calculation!
      symbol = '−';
      symbol2 = '+';
      const minStart = allowGreaterThan10 ? 11 : 2;
      const maxStart = Math.max(minStart, safeMaxOutcome);
      num1 = randomInt(minStart, maxStart);
      num2 = randomInt(1, num1); // guarantees intermediateDiff = num1 - num2 >= 0
      const intermediateDiff = num1 - num2;

      // Ensure final answer = intermediateDiff + num3 is between [safeMinOutcome, safeMaxOutcome]
      const minAdd = Math.max(1, safeMinOutcome - intermediateDiff);
      const maxAdd = Math.max(minAdd, safeMaxOutcome - intermediateDiff);
      num3 = randomInt(minAdd, maxAdd);
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

    const factorUpper = allowGreaterThan10 ? Math.max(11, maxFactor || 20) : 10;
    const multiplier = randomInt(1, factorUpper);

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
    const quotientUpper = allowGreaterThan10 ? Math.max(11, maxFactor || 20) : 10;

    // Decide whether this question should produce a decimal answer or an integer answer
    const useDecimal =
      allowDecimalsInDivision && (divisionDecimalsOnly || Math.random() >= 0.45);

    if (!useDecimal) {
      // Exact integer division ONLY (zero remainder)
      let divisor = tableStart;
      if (specificTables && specificTables.length > 0) {
        divisor = specificTables[Math.floor(Math.random() * specificTables.length)];
      } else {
        const minT = Math.max(1, Math.min(tableStart, tableEnd));
        const maxT = Math.max(minT, tableEnd);
        divisor = randomInt(minT, maxT);
      }

      const quotient = randomInt(1, quotientUpper);
      const dividend = divisor * quotient;

      num1 = dividend;
      num2 = divisor;
      answer = quotient;
    } else {
      // Clean decimal division (no infinite repeating decimals like 1/3!)
      if (divisionDecimalType === 'halves') {
        // Answers ending in ,5 (e.g. 3 ÷ 2 = 1,5; 9 ÷ 2 = 4,5; 6 ÷ 4 = 1,5; 15 ÷ 10 = 1,5)
        const cleanDivisorsForHalves = [2, 4, 6, 8, 10];
        const divisor =
          cleanDivisorsForHalves[Math.floor(Math.random() * cleanDivisorsForHalves.length)];
        const wholePart = randomInt(0, Math.max(1, quotientUpper - 1));
        const targetAnswer = wholePart + 0.5;
        const dividend = Math.round(targetAnswer * divisor);

        num1 = dividend;
        num2 = divisor;
        answer = Number(targetAnswer.toFixed(1));
      } else {
        // 'tenths': clean 1-decimal answers (divisors 2, 5, 10 -> .1, .2, .4, .5, .6, .8, etc.)
        const cleanDivisors = [2, 5, 10];
        const divisor = cleanDivisors[Math.floor(Math.random() * cleanDivisors.length)];
        const wholePart = randomInt(0, Math.max(1, quotientUpper - 1));

        let fractionSteps = 1;
        if (divisor === 2) {
          fractionSteps = 1; // 0.5
        } else if (divisor === 5) {
          fractionSteps = randomInt(1, 4); // 0.2, 0.4, 0.6, 0.8
        } else {
          fractionSteps = randomInt(1, 9); // 0.1 .. 0.9
        }

        const dividend = wholePart * divisor + fractionSteps;
        const targetAnswer = dividend / divisor;

        num1 = dividend;
        num2 = divisor;
        answer = Number(targetAnswer.toFixed(1));
      }
    }
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
    formattedAnswer: formatFinnishNumber(answer),
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
 * Handles Finnish comma separator (e.g. "4,5" === 4.5, "5" === 5)
 */
export function checkAnswer(userInput, expectedAnswer) {
  if (userInput === null || userInput === undefined || userInput.trim() === '') {
    return false;
  }
  // Replace Finnish comma with decimal point
  const normalized = userInput.toString().trim().replace(',', '.');
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) return false;
  // Account for floating point epsilon when decimals are generated
  return Math.abs(parsed - expectedAnswer) < 0.0001;
}
