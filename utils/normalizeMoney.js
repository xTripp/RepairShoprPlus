// This function converts the string of non-cash closing counts to the correct value format for RepairShopr regardless or locale
function normalizeMoney(value) {
    // Detect if the original decimal separator is a comma or dot
    const decimalSeparator = value.includes(',') && value.includes('.') ?
        (value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.') :
        (value.includes(',') ? ',' : '.');

    // Remove all thousands separators but keep the last one before the decimal point
    let normalizedValue = value.replace(/(,|\.)+(?=\d+(\.|,))/g, '');

    // Replace the remaining separator with the detected decimal separator
    normalizedValue = normalizedValue.replace(/(,|\.)/, decimalSeparator);

    return normalizedValue;
}

export{normalizeMoney}