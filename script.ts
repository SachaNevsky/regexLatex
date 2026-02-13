const regexInput = document.getElementById("regex-input") as HTMLInputElement;
const latexInput = document.getElementById("latex-input") as HTMLTextAreaElement;
const outputText = document.getElementById("output-text") as HTMLPreElement;
const copyButton = document.getElementById("copy-button") as HTMLButtonElement;
const regexError = document.getElementById("regex-error") as HTMLSpanElement;

let currentRegex: RegExp | null = null;

function validateRegex(): void {
    try {
        currentRegex = new RegExp(regexInput.value, "gu");
        regexInput.classList.remove("invalid");
        regexError.classList.add("hidden");
    } catch (e) {
        console.error("Error", e);
        currentRegex = null;
        regexInput.classList.add("invalid");
        regexError.classList.remove("hidden");
    }
}

function highlightLatex(text: string): string {
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    text = text.replace(/(^|[^\\])(%.*)/g, (_, pre, comment) =>
        `${pre}<span class="comment">${comment}</span>`
    );

    text = text.replace(/\\[%_{}$&#]/g, (m) =>
        `<span class="escape">${m}</span>`
    );

    text = text.replace(/\\(textwidth|midrule)\b/g, (m) =>
        `<span class="command">${m}</span>`
    );

    text = text.replace(/\$(.+?)\$/g, (_, content) => {
        const highlighted = content.replace(/\\[a-zA-Z]+/g, (cmd: string) =>
            `<span class="math-command">${cmd}</span>`
        );
        return `<span class="math">$</span><span class="math">${highlighted}</span><span class="math">$</span>`;
    });

    text = text.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, (match) => {
        return match
            .replace(/(\\[a-zA-Z]+)/, `<span class="command">$1</span>`)
            .replace(/\[([^\]]*)\]/, `<span class="arg">[$1]</span>`)
            .replace(/\{([^}]*)\}/, `<span class="arg">{$1}</span>`);
    });

    text = text.replace(/\\(begin|end|cite|citet|url|label)\{([^}]*)\}/g, (match: string, cmd: string, arg: string) =>
        `<span class="command">\\${cmd}</span><span class="arg">{${arg}}</span>`
    );

    return text;
}

function adjustCopyButtonPosition(): void {
    const output: HTMLPreElement = outputText;
    const copyBtn: HTMLButtonElement = copyButton;
    const hasScroll: boolean = output.scrollHeight > output.clientHeight;

    copyBtn.style.right = hasScroll ? "35px" : "10px";
}

function processText(): void {
    const raw: string = latexInput.innerText;
    let processed: string = raw;

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

const defaultRegex: string = "(^|[^\\\\])%.*";
const defaultButton: HTMLButtonElement = document.getElementById("default-regex") as HTMLButtonElement;

defaultButton.addEventListener("click", () => {
    regexInput.value = defaultRegex;
    validateRegex();
    processText();
});

regexInput.value = defaultRegex;
validateRegex();
processText();