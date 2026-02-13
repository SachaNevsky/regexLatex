"use strict";
const regexInput = document.getElementById("regex-input");
const latexInput = document.getElementById("latex-input");
const outputText = document.getElementById("output-text");
const copyButton = document.getElementById("copy-button");
const regexError = document.getElementById("regex-error");
let currentRegex = null;
function validateRegex() {
    try {
        currentRegex = new RegExp(regexInput.value, "gu");
        regexInput.classList.remove("invalid");
        regexError.classList.add("hidden");
    }
    catch (e) {
        console.error("Error", e);
        currentRegex = null;
        regexInput.classList.add("invalid");
        regexError.classList.remove("hidden");
    }
}
function highlightLatex(text) {
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(/(^|[^\\])(%.*)/g, (_, pre, comment) => `${pre}<span class="comment">${comment}</span>`);
    text = text.replace(/\\[%_{}$&#]/g, (m) => `<span class="escape">${m}</span>`);
    text = text.replace(/\\(textwidth|midrule)\b/g, (m) => `<span class="command">${m}</span>`);
    text = text.replace(/\$(.+?)\$/g, (_, content) => {
        const highlighted = content.replace(/\\[a-zA-Z]+/g, (cmd) => `<span class="math-command">${cmd}</span>`);
        return `<span class="math">$</span><span class="math">${highlighted}</span><span class="math">$</span>`;
    });
    text = text.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, (match) => {
        return match
            .replace(/(\\[a-zA-Z]+)/, `<span class="command">$1</span>`)
            .replace(/\[([^\]]*)\]/, `<span class="arg">[$1]</span>`)
            .replace(/\{([^}]*)\}/, `<span class="arg">{$1}</span>`);
    });
    text = text.replace(/\\(begin|end|cite|citet|url|label)\{([^}]*)\}/g, (match, cmd, arg) => `<span class="command">\\${cmd}</span><span class="arg">{${arg}}</span>`);
    return text;
}
function adjustCopyButtonPosition() {
    const output = outputText;
    const copyBtn = copyButton;
    const hasScroll = output.scrollHeight > output.clientHeight;
    copyBtn.style.right = hasScroll ? "35px" : "10px";
}
function processText() {
    const raw = latexInput.innerText;
    let processed = raw;
    if (currentRegex) {
        processed = processed.replace(currentRegex, (_, prefix) => {
            return prefix === '\n' ? '' : (prefix || '');
        });
    }
    processed = processed.replace(/\n{3,}/g, "\n\n");
    outputText.innerHTML = highlightLatex(processed);
}
regexInput.addEventListener("input", () => {
    validateRegex();
    processText();
});
latexInput.addEventListener("input", processText);
copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(outputText.textContent || "").then(() => {
        copyButton.textContent = "✅";
        setTimeout(() => (copyButton.textContent = "📋"), 1500);
    });
});
const defaultRegex = "(^|[^\\\\])%.*";
const defaultButton = document.getElementById("default-regex");
defaultButton.addEventListener("click", () => {
    regexInput.value = defaultRegex;
    validateRegex();
    processText();
});
regexInput.value = defaultRegex;
validateRegex();
processText();
