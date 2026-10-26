import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { OPERATION_CONFIG } from '../utils/mathGenerator';

export default function ConfigScreen({ initialConfig, onChangeConfig, onStartTest }) {
  const [operations, setOperations] = useState(initialConfig.operations || ['addition']);
  const [maxNumber, setMaxNumber] = useState(initialConfig.maxNumber || 20);
  const [customMax, setCustomMax] = useState(initialConfig.customMax || '');
  const [isCustomMax, setIsCustomMax] = useState(initialConfig.isCustomMax || false);

  // Greater than 10 & Min/Max sum/outcome limiters
  const [allowGreaterThan10, setAllowGreaterThan10] = useState(
    initialConfig.allowGreaterThan10 || false
  );
  const [minSumLimit, setMinSumLimit] = useState(
    initialConfig.minSumLimit !== undefined ? initialConfig.minSumLimit : 0
  );
  const [maxSumLimit, setMaxSumLimit] = useState(
    initialConfig.maxSumLimit !== undefined ? initialConfig.maxSumLimit : 30
  );
  const [maxFactor, setMaxFactor] = useState(initialConfig.maxFactor || 15);

  // Division decimal options (default false -> integers only!)
  const [allowDecimalsInDivision, setAllowDecimalsInDivision] = useState(
    initialConfig.allowDecimalsInDivision || false
  );
  const [divisionDecimalType, setDivisionDecimalType] = useState(
    initialConfig.divisionDecimalType || 'halves'
  ); // 'halves' | 'tenths'
  const [divisionDecimalsOnly, setDivisionDecimalsOnly] = useState(
    initialConfig.divisionDecimalsOnly || false
  );

  // Multiplication & Division limits
  const [tableStart, setTableStart] = useState(initialConfig.tableStart || 2);
  const [tableEnd, setTableEnd] = useState(initialConfig.tableEnd || 5);
  const [selectedTables, setSelectedTables] = useState(
    initialConfig.selectedTables?.length > 0 ? initialConfig.selectedTables : [2, 3, 4, 5]
  );
  const [multiplicationSelectionMode, setMultiplicationSelectionMode] = useState(
    initialConfig.multiplicationSelectionMode || 'range'
  ); // 'range' | 'specific'

  // Questions count
  const [questionCount, setQuestionCount] = useState(initialConfig.questionCount || 10);

  // Feedback mode: 'immediate' | 'end'
  const [feedbackMode, setFeedbackMode] = useState(initialConfig.feedbackMode || 'immediate');

  // Assistance option (Immediate mode only)
  const [enableAssistance, setEnableAssistance] = useState(
    initialConfig.enableAssistance !== undefined ? initialConfig.enableAssistance : true
  );
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(
    initialConfig.maxFailedAttempts || 2
  );

  const [validationError, setValidationError] = useState('');

  // Build normalized config object from current state
  const buildCurrentConfig = () => {
    const rawMax = isCustomMax
      ? Math.max(5, parseInt(customMax) || 20)
      : maxNumber;
    const parsedMinSum = Math.max(0, parseInt(minSumLimit) || 0);
    const parsedMaxSum = Math.max(12, parseInt(maxSumLimit) || 30);

    return {
      operations,
      maxNumber: rawMax,
      minNumber: 0,
      customMax,
      isCustomMax,
      allowGreaterThan10,
      minSumLimit: parsedMinSum,
      maxSumLimit: parsedMaxSum,
      maxFactor: parseInt(maxFactor) || 15,
      allowDecimalsInDivision,
      divisionDecimalType,
      divisionDecimalsOnly,
      tableStart: Math.min(tableStart, tableEnd),
      tableEnd: Math.max(tableStart, tableEnd),
      selectedTables,
      specificTables: multiplicationSelectionMode === 'specific' ? selectedTables : [],
      multiplicationSelectionMode,
      questionCount: parseInt(questionCount) || 10,
      feedbackMode,
      enableAssistance,
      maxFailedAttempts: parseInt(maxFailedAttempts) || 2,
    };
  };

  // Automatically persist configuration changes to localStorage whenever any setting changes
  useEffect(() => {
    if (onChangeConfig) {
      onChangeConfig(buildCurrentConfig());
    }
  }, [
    operations,
    maxNumber,
    customMax,
    isCustomMax,
    allowGreaterThan10,
    minSumLimit,
    maxSumLimit,
    maxFactor,
    allowDecimalsInDivision,
    divisionDecimalType,
    divisionDecimalsOnly,
    tableStart,
    tableEnd,
    selectedTables,
    multiplicationSelectionMode,
    questionCount,
    feedbackMode,
    enableAssistance,
    maxFailedAttempts,
  ]);

  // Toggle operations
  const toggleOperation = (opId) => {
    if (operations.includes(opId)) {
      if (operations.length === 1) {
        setValidationError('Valitse vähintään yksi laskutapa!');
        return;
      }
      setOperations(operations.filter((o) => o !== opId));
      setValidationError('');
    } else {
      setOperations([...operations, opId]);
      setValidationError('');
    }
  };

  // Quick range pills for addition/subtraction/combo bounds (Finnish school standards)
  const RANGE_PRESETS = [
    { label: '0–10', value: 10, grade: '1. luokan syksy' },
    { label: '0–20', value: 20, grade: '1. luokan kevät' },
    { label: '0–50', value: 50, grade: '2. luokan syksy' },
    { label: '0–100', value: 100, grade: '2. luokan kevät' },
  ];

  const handleToggleGreaterThan10 = (checked) => {
    setAllowGreaterThan10(checked);
    if (checked) {
      if (!isCustomMax && maxNumber <= 10) {
        setMaxNumber(30);
      }
      if ((parseInt(maxSumLimit) || 0) <= 10) {
        setMaxSumLimit(30);
      }
    }
  };

  // Specific multiplication tables toggle
  const toggleSpecificTable = (num) => {
    if (selectedTables.includes(num)) {
      if (selectedTables.length === 1) {
        setValidationError('Valitse vähintään yksi taulu!');
        return;
      }
      setSelectedTables(selectedTables.filter((t) => t !== num));
      setValidationError('');
    } else {
      const updated = [...selectedTables, num].sort((a, b) => a - b);
      setSelectedTables(updated);
      setValidationError('');
    }
  };

  const handleStart = () => {
    if (operations.length === 0) {
      setValidationError('Valitse vähintään yksi laskutapa jatkaaksesi!');
      return;
    }

    const parsedMinSum = Math.max(0, parseInt(minSumLimit) || 0);
    const parsedMaxSum = Math.max(12, parseInt(maxSumLimit) || 30);

    if (allowGreaterThan10 && parsedMinSum >= parsedMaxSum) {
      setValidationError('Pienimmän tuloksen (Min) täytyy olla pienempi kuin suurimman tuloksen (Max)!');
      return;
    }

    onStartTest(buildCurrentConfig());
  };

  const hasMultiplicationOrDivision =
    operations.includes('multiplication') || operations.includes('division');
  const hasDivision = operations.includes('division');
  const hasAdditionOrSubtraction =
    operations.includes('addition') ||
    operations.includes('subtraction') ||
    operations.includes('combo');

  const availableTables = allowGreaterThan10
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Welcome Hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-bold mb-2 shadow-sm">
          <span>🌟</span>
          <span>Hauskaa matikan harjoittelua</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          Valitse harjoituksen asetukset
        </h1>
        <p className="text-slate-600 font-medium mt-1 text-base sm:text-lg">
          Valitse laskutapa, vaikeustaso ja kysymysten määrä!
        </p>
      </div>

      {validationError && (
        <div className="mb-5 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-rose-800 font-bold animate-bounce-short">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* SECTION 1: OPERATIONS */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-100">
          <label className="block text-slate-800 font-black text-lg sm:text-xl mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">1</span>
            <span>Mitä haluat harjoitella?</span>
            <span className="text-xs text-slate-400 font-normal ml-auto">(Valitse yksi tai useampi)</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            {Object.values(OPERATION_CONFIG).map((op) => {
              const isSelected = operations.includes(op.id);
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => toggleOperation(op.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                    isSelected
                      ? `${op.lightColor} border-current shadow-md scale-[1.02] ring-2 ring-blue-400`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <span className="text-3xl sm:text-4xl">{op.icon}</span>
                  <span className="font-extrabold text-sm sm:text-base leading-tight mt-1">
                    {op.nameFi.split(' ')[0]}
                  </span>
                  <span className="text-xs font-semibold opacity-75">
                    {op.id === 'combo' ? 'esim. 2+3−5' : op.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DIFFICULTY / LIMITS FOR +, −, AND COMBO */}
        {hasAdditionOrSubtraction && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-100">
            <label className="block text-slate-800 font-black text-lg sm:text-xl mb-1 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-black">2</span>
              <span>Yhteen-, vähennys- ja yhdistelmälaskun lukualue</span>
            </label>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              Vastaukset ja välivaiheet ovat aina vähintään 0 (ei negatiivisia lukuja).
            </p>

            {!allowGreaterThan10 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                  {RANGE_PRESETS.map((preset) => {
                    const isSelected = !isCustomMax && maxNumber === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setMaxNumber(preset.value);
                          setIsCustomMax(false);
                        }}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-300 font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl font-black">{preset.label}</div>
                        <div className="text-[11px] font-semibold text-emerald-700/80 mt-0.5">{preset.grade}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom max option */}
                <div className="flex items-center gap-3 pt-2 pb-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomMax}
                      onChange={(e) => setIsCustomMax(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-400"
                    />
                    <span>Muu maksimiluku:</span>
                  </label>
                  {isCustomMax && (
                    <input
                      type="number"
                      inputMode="numeric"
                      min="5"
                      max="1000"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      placeholder="esim. 30"
                      className="w-28 px-3 py-1.5 text-base font-bold border-2 border-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  )}
                </div>
              </>
            )}

            {/* Greater than 10 toggle & Min/Max sum limiters for +, -, and combo */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-3">
                  <span className="font-bold text-emerald-950 text-sm sm:text-base block">
                    Suuremmat luvut (yli 10) & tuloksen rajat
                  </span>
                  <span className="text-xs text-emerald-800/80 block mt-0.5">
                    Aseta minimi- ja maksimirajat, jotta luvut eivät kasva liian suuriksi tai mene negatiivisiksi.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowGreaterThan10}
                  onChange={(e) => handleToggleGreaterThan10(e.target.checked)}
                  className="w-6 h-6 text-emerald-600 rounded-lg focus:ring-emerald-400 cursor-pointer shrink-0"
                />
              </label>

              {allowGreaterThan10 && (
                <div className="mt-3.5 pt-3.5 border-t border-emerald-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Pienin tulos / summa (Min ≥ 0):
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="500"
                        value={minSumLimit}
                        onChange={(e) => setMinSumLimit(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-lg font-black border-2 border-emerald-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Estää negatiiviset ja liian pienet tulokset
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Suurin tulos / summa (Max):
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="12"
                        max="1000"
                        value={maxSumLimit}
                        onChange={(e) => setMaxSumLimit(Math.max(12, parseInt(e.target.value) || 12))}
                        className="w-full px-3 py-1.5 text-lg font-black border-2 border-emerald-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Rajoittaa maksimisummaa (ei liian isoja lukuja)
                      </span>
                    </div>
                  </div>

                  {/* Quick presets for Min–Max limits */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-emerald-900">Pikavalinnat:</span>
                    {[
                      { label: '0 – 25', min: 0, max: 25 },
                      { label: '10 – 30', min: 10, max: 30 },
                      { label: '10 – 50', min: 10, max: 50 },
                      { label: '20 – 100', min: 20, max: 100 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setMinSumLimit(p.min);
                          setMaxSumLimit(p.max);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          minSumLimit === p.min && maxSumLimit === p.max
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: MULTIPLICATION & DIVISION GRANULAR LIMITS */}
        {hasMultiplicationOrDivision && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-100 space-y-4">
            <div>
              <label className="block text-slate-800 font-black text-lg sm:text-xl mb-1 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                  {hasAdditionOrSubtraction ? '3' : '2'}
                </span>
                <span>Kerto- ja jakolaskun asetukset</span>
              </label>
              <p className="text-xs sm:text-sm text-slate-500">
                Valitse harjoiteltavat taulut sekä lukujen rajat.
              </p>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setMultiplicationSelectionMode('range')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  multiplicationSelectionMode === 'range'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lukuväli (esim. 2 – 6)
              </button>
              <button
                type="button"
                onClick={() => setMultiplicationSelectionMode('specific')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  multiplicationSelectionMode === 'specific'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yksittäiset taulut
              </button>
            </div>

            {multiplicationSelectionMode === 'range' ? (
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Mistä taulusta / jakajasta:
                    </label>
                    <select
                      value={tableStart}
                      onChange={(e) => setTableStart(parseInt(e.target.value))}
                      className="w-full bg-white border-2 border-blue-300 font-black text-lg rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {availableTables.map((n) => (
                        <option key={n} value={n}>
                          {n}. taulu
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Mihin tauluun / jakajaan asti:
                    </label>
                    <select
                      value={tableEnd}
                      onChange={(e) => setTableEnd(parseInt(e.target.value))}
                      className="w-full bg-white border-2 border-blue-300 font-black text-lg rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {availableTables.map((n) => (
                        <option key={n} value={n}>
                          {n}. taulu
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-blue-700 font-bold text-center">
                  Harjoitellaan tauluja: {Math.min(tableStart, tableEnd)} – {Math.max(tableStart, tableEnd)} (kertoimet/tulokset 1–{allowGreaterThan10 ? maxFactor : 10})
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-2">
                  {availableTables.map((num) => {
                    const isSelected = selectedTables.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleSpecificTable(num)}
                        className={`h-12 rounded-xl font-black text-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTables(availableTables)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Valitse kaikki
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTables([2, 5, 10])}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Helpot (2, 5, 10)
                  </button>
                </div>
              </div>
            )}

            {/* Greater than 10 toggle for Multiplication & Division */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-3">
                  <span className="font-bold text-blue-950 text-sm sm:text-base block">
                    Suuremmat luvut (yli 10)
                  </span>
                  <span className="text-xs text-blue-800/80 block mt-0.5">
                    Sallii yli 10 menevät kertoimet ja jakolaskun tulokset (rajoittimella).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowGreaterThan10}
                  onChange={(e) => handleToggleGreaterThan10(e.target.checked)}
                  className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-400 cursor-pointer shrink-0"
                />
              </label>

              {allowGreaterThan10 && (
                <div className="mt-3 pt-2.5 border-t border-blue-200/80 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-blue-900">
                    Suurin kerroin / jakolaskun vastaus (Max):
                  </span>
                  <select
                    value={maxFactor}
                    onChange={(e) => setMaxFactor(parseInt(e.target.value))}
                    className="bg-white border-2 border-blue-300 rounded-xl px-3 py-1 text-sm font-black text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="12">12 asti</option>
                    <option value="15">15 asti</option>
                    <option value="20">20 asti</option>
                    <option value="30">30 asti</option>
                    <option value="50">50 asti</option>
                  </select>
                </div>
              )}
            </div>

            {/* DIVISION DECIMAL OPTIONS (Only when division is selected; otherwise strictly integers!) */}
            {hasDivision && (
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="pr-3">
                    <span className="font-bold text-purple-950 text-sm sm:text-base block">
                      Desimaalivastaukset jakolaskussa (esim. 5 ÷ 2 = 2,5)
                    </span>
                    <span className="text-xs text-purple-800/80 block mt-0.5">
                      {allowDecimalsInDivision
                        ? 'Jakolaskuissa voi tulla tarkkoja desimaalilukuja.'
                        : 'Pois päältä: jakolaskuissa tulee vain tasaisia kokonaislukuja.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowDecimalsInDivision}
                    onChange={(e) => setAllowDecimalsInDivision(e.target.checked)}
                    className="w-6 h-6 text-purple-600 rounded-lg focus:ring-purple-400 cursor-pointer shrink-0"
                  />
                </label>

                {allowDecimalsInDivision && (
                  <div className="mt-3.5 pt-3 border-t border-purple-200/80 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1.5">
                        Desimaalien tyyppi:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDivisionDecimalType('halves')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            divisionDecimalType === 'halves'
                              ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                              : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100 font-semibold'
                          }`}
                        >
                          <div className="text-xs sm:text-sm">Vain puolikkaat (,5)</div>
                          <div className="text-[11px] opacity-80">Esim. 3 ÷ 2 = 1,5 tai 9 ÷ 2 = 4,5</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDivisionDecimalType('tenths')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            divisionDecimalType === 'tenths'
                              ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                              : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100 font-semibold'
                          }`}
                        >
                          <div className="text-xs sm:text-sm">1 desimaalin tarkat luvut</div>
                          <div className="text-[11px] opacity-80">Esim. ,2 • ,4 • ,5 • ,8 (jakajat 2, 5, 10)</div>
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-purple-900">
                      <input
                        type="checkbox"
                        checked={divisionDecimalsOnly}
                        onChange={(e) => setDivisionDecimalsOnly(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-400"
                      />
                      <span>Kysy jakolaskussa pelkästään desimaalilaskuja (ei kokonaislukuja)</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: TEST LENGTH (NUMBER OF QUESTIONS) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-100">
          <label className="block text-slate-800 font-black text-lg sm:text-xl mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-black">
              {hasAdditionOrSubtraction && hasMultiplicationOrDivision ? '4' : '3'}
            </span>
            <span>Kysymysten määrä</span>
          </label>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {[5, 10, 20, 50].map((cnt) => {
              const isSelected = questionCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-3 sm:py-4 rounded-2xl border-2 font-black text-xl sm:text-2xl transition-all ${
                    isSelected
                      ? 'bg-purple-500 text-white border-purple-600 shadow-md ring-2 ring-purple-300 scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cnt}
                  <span className="block text-xs font-semibold mt-0.5 opacity-90">laskua</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: FEEDBACK MODE & ASSISTANCE */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-100">
          <label className="block text-slate-800 font-black text-lg sm:text-xl mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-black">
              {hasAdditionOrSubtraction && hasMultiplicationOrDivision ? '5' : '4'}
            </span>
            <span>Palautetapa & Apu</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFeedbackMode('immediate')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                feedbackMode === 'immediate'
                  ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>⚡</span> Välitön palaute
                </span>
                {feedbackMode === 'immediate' && (
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Kertoo heti jokaisen laskun jälkeen, oliko vastaus oikein. Suositeltava harjoitteluun!
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFeedbackMode('end')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                feedbackMode === 'end'
                  ? 'bg-indigo-50 border-indigo-400 text-slate-900 shadow-sm ring-2 ring-indigo-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>📝</span> Kokeen lopussa
                </span>
                {feedbackMode === 'end' && (
                  <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Pisteet ja virheet näytetään vasta kun koko koe on valmis. Sopii koetilanteisiin!
              </p>
            </button>
          </div>

          {/* Assistance toggle (Only shown if Immediate mode) */}
          {feedbackMode === 'immediate' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-3">
                  <span className="font-bold text-slate-800 text-sm sm:text-base block">
                    Näytä oikea vastaus virheiden jälkeen
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Auttaa lasta oppimaan oikean tuloksen, jos lasku tuntuu vaikealta.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAssistance}
                  onChange={(e) => setEnableAssistance(e.target.checked)}
                  className="w-6 h-6 text-amber-500 rounded-lg focus:ring-amber-400 cursor-pointer"
                />
              </label>

              {enableAssistance && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    Paljasta oikea vastaus, kun on yritetty:
                  </span>
                  <select
                    value={maxFailedAttempts}
                    onChange={(e) => setMaxFailedAttempts(e.target.value)}
                    className="bg-white border-2 border-slate-300 rounded-xl px-2.5 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="1">1 väärän yrityksen jälkeen</option>
                    <option value="2">2 väärän yrityksen jälkeen (Suositus)</option>
                    <option value="3">3 väärän yrityksen jälkeen</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* START BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-8 h-8 fill-current" />
            <span>Aloita harjoitus!</span>
            <Sparkles className="w-6 h-6 animate-spin" />
          </button>
        </div>
      </div>
    </div>
  );
}
