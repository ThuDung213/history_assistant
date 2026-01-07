function generateLipSyncFromText(text) {
    const result = [];

    // Be defensive: callers should pass a string, but API responses can sometimes be objects.
    let normalizedText = text;
    if (normalizedText == null) return result;
    if (typeof normalizedText !== 'string') {
        if (typeof normalizedText === 'object' && typeof normalizedText.answer === 'string') {
            normalizedText = normalizedText.answer;
        } else {
            return result;
        }
    }

    const chars = normalizedText.replace(/\s+/g, '').split('');
    let time = 0;
    const timePerChar = 0.12; // 120ms/âm, đọc tiếng Việt chậm hơn chút

    for (let char of chars) {
        const c = char.toLowerCase();
        let mouth = "X"; // mặc định: miệng đóng

        // Môi khép (p, b, m)
        if ("pbm".includes(c)) mouth = "B";

        // Nguyên âm mở rộng
        else if ("aăâeê".includes(c)) mouth = "D"; // há miệng rộng

        // Nguyên âm tròn môi
        else if ("roôơ".includes(c)) mouth = "E"; // môi tròn
        else if ("uư".includes(c)) mouth = "F"; // môi chu

        // Nguyên âm hẹp
        else if ("iy".includes(c)) mouth = "C"; // miệng hẹp dọc

        // Âm gió
        else if ("fv".includes(c)) mouth = "G";
        else if ("th".includes(c)) mouth = "H";

        // Âm cứng (c, k, g, ng, q)
        else if ("ckgq".includes(c)) mouth = "C";

        // Thêm frame
        result.push({ time, mouth });
        time += timePerChar;
    }

    return result;
}

export default generateLipSyncFromText;
