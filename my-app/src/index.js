import { dataMap, searchMap } from "./mockedJson.js";
// Elements from HTML for direct access in typescript
var commandInput;
var history;
var modeDisplay;
// Array of command history to allow for re-rendering when switching modes
var historyValues = [];
// Variable for loaded CSV
var file = null;
// Variable for storing loaded file name
var fileName = null;
// Brief mode variable
var briefMode = true;
// Map of commands to functions
var commandMap = {
    "search": search,
    "view": view,
    "load_file": loadFile,
    "mode": toggleMode
};
// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = function () {
    prepareKeypress();
    prepareButtonPress();
    prepareHistory();
    prepareModeDisplay();
    renderModeDisplay();
};
// Function that mimics loading and parsing data
// Returns:
//    - Map<string, array<string>> if data has header
//    - array<array<string>> if data does not have header
function getData(path) {
    return dataMap[path];
}
// Prepares the display of the "Brief" / "Verbose" mode
function prepareModeDisplay() {
    var maybeMode = document.getElementById("mode");
    if (maybeMode == null) {
        console.log("mode display not found");
    }
    else if (!(maybeMode instanceof HTMLSpanElement)) {
        console.log("Found element ".concat(maybeMode, ", but not span"));
    }
    else {
        modeDisplay = maybeMode;
        renderModeDisplay();
    }
}
// Renders only the display of the "Brief" / "Verbose" mode
function renderModeDisplay() {
    if (modeDisplay == null)
        return;
    if (briefMode) {
        modeDisplay.innerHTML = "Brief";
    }
    else {
        modeDisplay.innerHTML = "Verbose";
    }
}
// Toggles between "Brief" / "Verbose" mode. Users can choose to specify which mode
function toggleMode(args) {
    if (args.length > 2) {
        // If more arguments than intended, return error string
        return "Error: incorrect number of arguments";
    }
    if (args.length === 1) {
        // If only one argument, which is the "mode" command itself, then flip briefMode to other mode
        briefMode = !briefMode;
    }
    else {
        // If there is another argument, argument 1 must specify "Brief" / "Verbose"
        var arg = args[1].toLowerCase();
        // Toggle briefMode accordingly
        if (arg === "brief") {
            briefMode = true;
        }
        else if (arg === "verbose") {
            briefMode = false;
        }
        else {
            // If mode not recognized, return error string
            return "Error: Unrecognized mode ".concat(args[1], ", please select either \"Brief\" or \"Verbose\"");
        }
    }
    // Re-render display of mode and history div
    renderHistory();
    renderModeDisplay();
    // Return command output
    return "Mode switched to ".concat(briefMode ? '"Brief"' : '"Verbose"');
}
// Function for viewing the CSV file
// Returns a string of the HTML table element if possible
function view(args) {
    if (file == null) {
        return "No file loaded";
    }
    if (args.length !== 1) {
        return "Error: incorrect number of arguments";
    }
    var tableString = "<table>";
    var restructuredArr = [];
    if (file instanceof (Array)) {
        if (file.length !== 0) {
            for (var _ in file[0]) {
                restructuredArr.push("<tr>");
            }
            file.forEach(function (arr) {
                var rowNum = 0;
                arr.forEach(function (elem) {
                    restructuredArr[rowNum] += "<td>".concat(elem, "</td>");
                    rowNum += 1;
                });
            });
            restructuredArr = restructuredArr.map(function (tr) {
                return tr + "</tr>";
            });
        }
    }
    else {
        if (Object.keys(file).length !== 0) {
            var header = "<tr>";
            for (var k in file) {
                header += "<th>".concat(k, "</th>");
            }
            header += "</tr>";
            tableString += header;
            file[Object.keys(file)[0]].forEach(function (_) {
                restructuredArr.push("<tr>");
            });
            var _loop_1 = function (k) {
                var rowNum = 0;
                file[k].forEach(function (elem) {
                    restructuredArr[rowNum] += "<td>".concat(elem, "</td>");
                    rowNum += 1;
                });
            };
            for (var k in file) {
                _loop_1(k);
            }
            restructuredArr = restructuredArr.map(function (tr) {
                return tr + "</tr>";
            });
        }
    }
    tableString += restructuredArr.join("");
    tableString += "</table>";
    return tableString;
}
// Function for unloading file
function unloadFile() {
    fileName = null;
    file = null;
}
// Function for loading the CSV file
// Parameter is filepath
// Returns whether file is loaded or not
function loadFile(args) {
    // Return error for wrong number of arguments
    if (args.length !== 2) {
        return "Error: Wrong number of arguments, please only provide path to the CSV";
    }
    // get fileData via getData() function
    var path = args[1];
    var fileData = getData(path);
    // Determine what type fileData is
    if (fileData == null) {
        return "Error: File not found";
    }
    else if (fileData instanceof (Array)) {
        file = fileData;
        fileName = path;
        return "Loaded ".concat(path, " as a CSV file with no header");
    }
    else {
        file = fileData;
        fileName = path;
        return "Loaded ".concat(path, " as a CSV file with header");
    }
}
// Function for searching in CSV
// Parameters are column (index or name) and value
// Returns table of row(s) in which the value is present
function search(args) {
    // Return error for wrong number of arguments
    if (args.length !== 3) {
        return "Error: Wrong number of arguments, please provide column index/name and value to search for";
    }
    if ((fileName == null) || (file == null)) {
        return "Error: No file loaded, please use load_file command to load file";
    }
    var results;
    var col = args[1];
    var value = args[2];
    var searches = searchMap[fileName];
    var colId = col.trim();
    if (colId.length === 0) {
        return "Error: empty column id";
    }
    var colInd = parseInt(colId);
    // check file type
    if (file instanceof (Array)) {
        // file has no header, make sure col is integer, col exists, and returns relevant search
        if (isNaN(colInd)) {
            return "Error: please provide column index for file without header";
        }
        if (file.length <= colInd) {
            return "Error: column not found";
        }
        if (searches["".concat(colInd, " ").concat(value)] === undefined) {
            return "No results";
        }
        results = searches["".concat(colInd, " ").concat(value)];
    }
    else {
        // file has header, make sure col exists and returns relevant search
        if (file[colId] === undefined) {
            return "Error: column not found";
        }
        if (searches["".concat(colId, " ").concat(value)] === undefined) {
            return "No results";
        }
        results = searches["".concat(colId, " ").concat(value)];
    }
    if (results.length == 0) {
        return "No results";
    }
    var table = "<table>";
    results.forEach(function (row) {
        table += "<tr>";
        row.forEach(function (elem) {
            table += "<td>".concat(elem, "</td>");
        });
        table += "</tr>";
    });
    table += "</table>";
    return table;
}
// Prepares the repl history div element
function prepareHistory() {
    var maybeHistory = document.getElementById("history");
    if (maybeHistory == null) {
        console.log("Couldn't find div element");
    }
    else if (!(maybeHistory instanceof HTMLDivElement)) {
        console.log("Found element ".concat(maybeHistory, ", but it wasn't a Div"));
    }
    else {
        history = maybeHistory;
    }
}
// Prepares the command submit button element and adds listener
function prepareButtonPress() {
    var maybeButtons = document.getElementsByClassName("submit-button");
    var maybeButton = maybeButtons.item(0);
    if (maybeButton == null) {
        console.log("Couldn't find input element");
    }
    else if (!(maybeButton instanceof HTMLButtonElement)) {
        console.log("Found element ".concat(maybeButton, ", but it wasn't a Button"));
    }
    else {
        maybeButton.addEventListener("click", handleButton);
    }
}
// Function for clearing command history both in record and HTML
function clearHistory() {
    historyValues = [];
    if (history == null)
        return;
    history.innerHTML = "";
}
// Re-renders all previous commands and outputs based on brief mode
function renderHistory() {
    if (history == null)
        return;
    // Clear HTML in history div
    history.innerHTML = "";
    // For every (command, output) pair, render based on brief mode
    historyValues.forEach(function (value) {
        if (briefMode) {
            history.innerHTML += "\n            <div class=\"repl-block\">\n            ".concat(value.output, "\n            </div>");
        }
        else {
            history.innerHTML += "\n            <div class=\"repl-block\">\n            Command: ".concat(value.command, "\n            <hr>\n            Output: ").concat(value.output, "\n            </div>");
        }
    });
}
// Handles button-click event
function handleButton(_) {
    // Check if command input is empty
    if (commandInput.value.trim() !== "") {
        // Split input into arguments
        var args = commandInput.value.trim().split(" ");
        // Retrieve function from commandMap
        var possibleFunc = commandMap[args[0]];
        // Instantiate result string
        var res = void 0;
        if (possibleFunc == null) {
            // If there is no function mapped to the given command, then it is an invalid command
            res = "Invalid command";
        }
        else {
            // If there is a function, pass in all arguments of command
            res = possibleFunc(args);
        }
        // Record command and output
        historyValues.push({
            command: commandInput.value,
            output: res
        });
        // Re-render history div based on brief mode settings
        renderHistory();
    }
    // Clear command input
    commandInput.value = "";
}
// Prepares for Keypress events
function prepareKeypress() {
    // As far as TypeScript knows, there may be *many* elements with this class.
    var maybeInputs = document.getElementsByClassName('repl-command-box');
    // Assumption: there's only one thing
    var maybeInput = maybeInputs.item(0);
    // Is the thing there? Is it of the expected type? 
    //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
    if (maybeInput == null) {
        console.log("Couldn't find input element");
    }
    else if (!(maybeInput instanceof HTMLInputElement)) {
        console.log("Found element ".concat(maybeInput, ", but it wasn't an input"));
    }
    else {
        commandInput = maybeInput;
        // Notice that we're passing *THE FUNCTION* as a value, not calling it.
        // The browser will invoke the function when a key is pressed with the input in focus.
        //  (This should remind you of the strategy pattern things we've done in Java.)
        commandInput.addEventListener("keypress", handleKeypress);
    }
}
// We'll use a global state reference for now
var pressCount = 0;
function getPressCount() {
    return pressCount;
}
function handleKeypress(event) {
    // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
    if (event.key === "Enter") {
        handleButton(null);
    }
    pressCount = pressCount + 1;
    console.log(event.key === "Enter");
}
// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export { handleKeypress, prepareKeypress, getPressCount, handleButton, briefMode, loadFile, toggleMode, view, clearHistory, unloadFile, search, renderHistory, historyValues, prepareButtonPress, prepareHistory, prepareModeDisplay, renderModeDisplay };
