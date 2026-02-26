// ---- Stage handling ----
const startBtn = document.getElementById("start-btn");
const stages = document.querySelectorAll(".stage");
// ---- Background music control ----
const musicToggle = document.getElementById("music-toggle");
const bgMusic = document.getElementById("bg-music");
let musicPlaying = false;

musicToggle.addEventListener("click", () => {
    if (!bgMusic) return;

    if (!musicPlaying) {
        bgMusic.play().then(() => {
            musicPlaying = true;
            musicToggle.textContent = "Pause Music";
        }).catch((err) => {
            console.warn("Autoplay blocked or error:", err);
        });
    } else {
        bgMusic.pause();
        musicPlaying = false;
        musicToggle.textContent = "Play Music";
    }
});

const stagePanels = {
    1: document.getElementById("stage-1"),
    2: document.getElementById("stage-2"),
    3: document.getElementById("stage-3")
};

let currentStage = 1;
let maxUnlockedStage = 1; // highest stage the player has reached


function setActiveStage(num) {
    currentStage = num;
    if (num > maxUnlockedStage) {
        maxUnlockedStage = num;
    }

    // Update stage dots
    stages.forEach((s) => {
        const stageNum = Number(s.dataset.stage);
        s.classList.toggle("active", stageNum === num);
        s.classList.toggle("completed", stageNum <= maxUnlockedStage);
    });

    // Show the correct panel
    Object.entries(stagePanels).forEach(([id, el]) => {
        el.classList.toggle("hidden", Number(id) !== num);
    });
}


startBtn.addEventListener("click", () => {
    setActiveStage(1);
    window.scrollTo({ top: document.querySelector(".timeline").offsetTop - 40, behavior: "smooth" });
});

// Allow clicking on completed stages to jump back/forth
stages.forEach((s) => {
    s.addEventListener("click", () => {
        const stageNum = Number(s.dataset.stage);

        // Only allow jump if this stage is already unlocked
        if (stageNum <= maxUnlockedStage) {
            setActiveStage(stageNum);
            // Optional: scroll to panels if you like
            window.scrollTo({
                top: document.querySelector(".timeline").offsetTop - 40,
                behavior: "smooth"
            });
        }
    });
});


// ---- Stage 1: Riddle ----
// Tokyo(5) + Berlin(6) + Nairobi(7) + Denver(6) + Rio(3) = 27
const RIDDLE_CODE = 27;
const riddleInput = document.getElementById("riddle-answer");
const riddleSubmit = document.getElementById("riddle-submit");
const riddleFeedback = document.getElementById("riddle-feedback");

riddleSubmit.addEventListener("click", () => {
    const val = Number(riddleInput.value.trim());
    if (!val) {
        riddleFeedback.textContent = "The Professor expects a number, not an empty plan.";
        riddleFeedback.className = "feedback error";
        return;
    }

    if (val === RIDDLE_CODE) {
        riddleFeedback.textContent = "Vault unlocked. The crew chat log is now accessible.";
        riddleFeedback.className = "feedback success";
        setTimeout(() => setActiveStage(2), 700);
    } else {
        riddleFeedback.textContent = "Wrong code. Recount the city letters carefully.";
        riddleFeedback.className = "feedback error";
    }
});

// ---- Stage 2: button to console ----
document
    .getElementById("to-console-btn")
    .addEventListener("click", () => setActiveStage(3));


// ---- Stage 3: Terminal emulation ----
const termOutput = document.getElementById("terminal-output");
const termInput = document.getElementById("terminal-input");
const finalMessage = document.getElementById("final-message");

function printLine(text, cls) {
    const line = document.createElement("div");
    line.className = "term-line";
    if (cls) line.classList.add(cls);
    line.textContent = text;
    termOutput.appendChild(line);
    termOutput.scrollTop = termOutput.scrollHeight;
}

function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    printLine(`professor@lacasadectf:~$ ${cmd}`);

    switch (cmd) {
        case "help":
            printLine("Commands: crew, hint, trace, clear");
            break;
        case "crew":
            printLine("Crew status: Tokyo, Berlin, Nairobi, Denver, Rio – in position.");
            printLine("Note: Professor obfuscated the final coordinates in the system.");
            break;
        case "hint":
            printLine("Hint: Search for something that doesn't run, but still holds a location.");
            printLine("      View Source isn't just for developers.");
            finalMessage.classList.remove("hidden");
            break;
        case "trace":
            printLine("Interpol trace detected near the drop location…");
            printLine("Signal scrambled. Last known log hidden inside the client code.");
            break;
        case "clear":
            termOutput.innerHTML = "";
            break;
        default:
            printLine(`Unknown command: ${cmd}`);
            printLine("Try: help");
    }
}

termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleCommand(termInput.value);
        termInput.value = "";
    }
});

// Auto focus terminal when Stage 3 shows (small UX)
const observer = new MutationObserver(() => {
    if (!stagePanels[3].classList.contains("hidden")) {
        termInput.focus();
    }
});
observer.observe(stagePanels[3], { attributes: true, attributeFilter: ["class"] });

/* ============================================================================
   HIDDEN COORDINATES SECTION (for CTF creators)
   ----------------------------------------------------------------------------
   Change the parts below to your own latitude and longitude. Players are
   nudged via:
   - chat messages mentioning "console", "lines", "numbers", "coordinates"
   - terminal commands: 'hint' and 'trace'
   A curious player will open DevTools or View Source and eventually find this.
   ============================================================================
*/

// Example hidden coordinates: Madrid approx (latitude 40.4168, longitude -3.7038)
// Replace these with your real values.
const secretLatParts = ["40", ".", "4168"];
const secretLngParts = ["-3", ".", "7038"];

// This function is NEVER called by the UI. It's just here as a believable
// "debug helper" that a player might discover and execute from the console.
function _professorGetDropCoordinates() {
    const lat = secretLatParts.join("");
    const lng = secretLngParts.join("");
    // Intentionally vague console message to make it feel like a debug log.
    console.log(
        "%c[Professor] Final drop location locked.",
        "color:#bf0904;font-weight:bold;"
    );
    console.log(
        "%cLatitude: " + lat + " | Longitude: " + lng,
        "color:#11c76f;"
    );
    return { lat, lng };
}

/*
Another subtle breadcrumb:
If a smart player searches for "drop location" text in this file,
they will land in this section.

You can also add a tiny hint in HTML comments near the footer if you want:
<!-- Only fools ignore the Professor's debug helpers. -->
*/
