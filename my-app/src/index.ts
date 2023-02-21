import { dataMap, searchMap } from "./mockedJson.js";
import "./styles/main.css";

// Elements from HTML for direct access in typescript
let commandInput: HTMLInputElement;
let history: HTMLDivElement;
let modeDisplay: HTMLSpanElement;

// Array of command history to allow for re-rendering when switching modes
let historyValues: Array<{
    command: string,
    output: string}> = [];

// Variable for loaded CSV
let file: Array<Array<string>> | {[key: string]: string[]} | null = null;

// Variable for storing loaded file name
let fileName: string | null = null;

// Brief mode variable
let briefMode: boolean = true;

// Map of commands to functions
let commandMap: {[key: string]: (args: string[]) => string} = {
    "search": search,
    "view": view,
    "load_file": loadFile,
    "mode": toggleMode
};

// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {    
    prepareKeypress()    
    prepareButtonPress()
    prepareHistory()
    prepareModeDisplay()
    renderModeDisplay()
}

// Function that mimics loading and parsing data
// Returns:
//    - Map<string, array<string>> if data has header
//    - array<array<string>> if data does not have header
function getData(path: string): Array<Array<string>> | {[key: string]: string[]} {
    return dataMap[path];
}

// Prepares the display of the "Brief" / "Verbose" mode
function prepareModeDisplay(): void {
    const maybeMode: Element | null = document.getElementById("mode");
    if (maybeMode == null) {
        console.log("mode display not found");
    } else if (!(maybeMode instanceof HTMLSpanElement)) {
        console.log(`Found element ${maybeMode}, but not span`);
    } else {
        modeDisplay = maybeMode;
        renderModeDisplay()
    }
}

// Renders only the display of the "Brief" / "Verbose" mode
function renderModeDisplay(): void {
    if (modeDisplay == null) return;
    if (briefMode) {
        modeDisplay.innerHTML = "Brief";
    } else {
        modeDisplay.innerHTML = "Verbose";
    }
}

// Toggles between "Brief" / "Verbose" mode. Users can choose to specify which mode
function toggleMode(args: string[]): string {
    if (args.length > 2) {
        // If more arguments than intended, return error string
        return "Error: incorrect number of arguments";
    }
    if (args.length === 1) {
        // If only one argument, which is the "mode" command itself, then flip briefMode to other mode
        briefMode = !briefMode;
    } else {
        // If there is another argument, argument 1 must specify "Brief" / "Verbose"
        const arg: string = args[1].toLowerCase();

        // Toggle briefMode accordingly
        if (arg === "brief") {
            briefMode = true;
        } else if (arg === "verbose") {
            briefMode = false;
        } else {
            // If mode not recognized, return error string
            return `Error: Unrecognized mode ${args[1]}, please select either "Brief" or "Verbose"`;
        }
    }
    // Re-render display of mode and history div
    renderHistory();
    renderModeDisplay();

    // Return command output
    return `Mode switched to ${briefMode? '"Brief"': '"Verbose"'}`;

}

// Function for viewing the CSV file
// Returns a string of the HTML table element if possible
function view(args: string[]): string {
    if (file == null) {
        return "No file loaded";
    }
    if (args.length !== 1) {
        return "Error: incorrect number of arguments";
    }
    let tableString: string = "<table>"
    let restructuredArr: Array<string> = [];
    if (file instanceof Array<Array<string>>) {
        if (file.length !== 0) {
            for (let _ in file[0]) {
                restructuredArr.push("<tr>");
            }
            file.forEach((arr: Array<string>) => {
                let rowNum: number = 0;
                arr.forEach((elem: string) => {
                    restructuredArr[rowNum] += `<td>${elem}</td>`;
                    rowNum += 1;
                });
            });
            restructuredArr = restructuredArr.map((tr: string) => {
                return tr + "</tr>";
            });
        }
    }else {
        if (Object.keys(file).length !== 0) {
            let header: string = "<tr>";
            for (let k in file) {
                header += `<th>${k}</th>`;
            }
            header += "</tr>";
            tableString += header;
            file[Object.keys(file)[0]].forEach((_: string) => {
                restructuredArr.push("<tr>");
            });
            for (let k in file) {
                let rowNum: number = 0;
                file[k].forEach((elem: string) => {
                    restructuredArr[rowNum] += `<td>${elem}</td>`;
                    rowNum += 1;
                });
            }
            restructuredArr = restructuredArr.map((tr: string) => {
                return tr + "</tr>";
            });
        }
    }
    tableString += restructuredArr.join("");
    tableString += "</table>";
    return tableString;
}

// Function for unloading file
function unloadFile(): void {
    fileName = null;
    file = null;
}

// Function for loading the CSV file
// Parameter is filepath
// Returns whether file is loaded or not
function loadFile(args: string[]): string {
    // Return error for wrong number of arguments
    if (args.length !== 2) {
        return "Error: Wrong number of arguments, please only provide path to the CSV";
    }
    // get fileData via getData() function
    const path: string = args[1];
    const fileData: {[key: string]: string[]} | Array<Array<string>> | null = getData(path);
    // Determine what type fileData is
    if (fileData == null) {
        return "Error: File not found";
    } else if (fileData instanceof Array<Array<string>>) {
        file = fileData;
        fileName = path;
        return `Loaded ${path} as a CSV file with no header`;
    } else {
        file = fileData;
        fileName = path;
        return `Loaded ${path} as a CSV file with header`;
    }
}

// Function for searching in CSV
// Parameters are column (index or name) and value
// Returns table of row(s) in which the value is present
function search(args: string[]): string {
    // Return error for wrong number of arguments
    if (args.length !== 3) {
        return "Error: Wrong number of arguments, please provide column index/name and value to search for";
    }
    if ((fileName == null) || (file == null)) {
        return "Error: No file loaded, please use load_file command to load file"
    }
    let results: Array<Array<string>>;
    const col = args[1];
    const value = args[2];
    const searches: {[key: string]: Array<Array<string>>} | null = searchMap[fileName];
    const colId: string = col.trim();
    if (colId.length === 0) {
        return "Error: empty column id";
    }
    const colInd: number = parseInt(colId);
    // check file type
    if (file instanceof Array<Array<string>>) {
        // file has no header, make sure col is integer, col exists, and returns relevant search
        if (isNaN(colInd)) {
            return "Error: please provide column index for file without header";
        }
        if (file.length <= colInd) {
            return "Error: column not found";
        }
        if (searches[`${colInd} ${value}`] === undefined) {
            return "No results";
        }
        results = searches[`${colInd} ${value}`];
    } else {
        // file has header, make sure col exists and returns relevant search
        if (file[colId] === undefined) {
            return "Error: column not found";
        }
        if (searches[`${colId} ${value}`] === undefined) {
            return "No results";
        }
        results = searches[`${colId} ${value}`];
    }
    if (results.length == 0) {
        return "No results";
    }
    let table: string = "<table>";
    results.forEach((row: string[]) => {
        table += "<tr>";
        row.forEach((elem: string) => {
            table += `<td>${elem}</td>`;
        });
        table += "</tr>";
    });
    table += "</table>";
    return table;
}

// Prepares the repl history div element
function prepareHistory() {
    const maybeHistory: Element | null = document.getElementById("history");
    if (maybeHistory == null){
        console.log("Couldn't find div element")
    } else if (!(maybeHistory instanceof HTMLDivElement)) {
        console.log(`Found element ${maybeHistory}, but it wasn't a Div`)
    } else {
        history = maybeHistory;
    }
}

// Prepares the command submit button element and adds listener
function prepareButtonPress(){
    const maybeButtons: HTMLCollectionOf<Element> = document.getElementsByClassName("submit-button")
    const maybeButton: Element | null = maybeButtons.item(0)
    
    if(maybeButton == null){
        console.log("Couldn't find input element")
    } else if(!(maybeButton instanceof HTMLButtonElement)) {
        console.log(`Found element ${maybeButton}, but it wasn't a Button`)
    } else {
        maybeButton.addEventListener("click", handleButton);
    }   
}

// Function for clearing command history both in record and HTML
function clearHistory(): void {
    historyValues = [];
    if (history == null) return;
    history.innerHTML = "";
}

// Re-renders all previous commands and outputs based on brief mode
function renderHistory(): void {
    
    if (history == null) return;
    // Clear HTML in history div
    history.innerHTML = "";
    // For every (command, output) pair, render based on brief mode
    historyValues.forEach((value: {command: string, output: string}) => {
        
        if (briefMode) {
            history.innerHTML += `
            <div class="repl-block">
            ${value.output}
            </div>`
        } else {
            history.innerHTML += `
            <div class="repl-block">
            Command: ${value.command}
            <hr>
            Output: ${value.output}
            </div>`
        }
    })
}

// Handles button-click event
function handleButton(_: MouseEvent | null) {

    // Check if command input is empty
    if (commandInput.value.trim() !== "") {
        // Split input into arguments
        const args: string[] = commandInput.value.trim().split(" ");
        // Retrieve function from commandMap
        const possibleFunc: ((args: string[]) => string) | null = commandMap[args[0]];
        // Instantiate result string
        let res: string;
        if (possibleFunc == null) {
            // If there is no function mapped to the given command, then it is an invalid command
            res = "Invalid command";
        } else {
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
    const maybeInputs: HTMLCollectionOf<Element> = document.getElementsByClassName('repl-command-box')
    // Assumption: there's only one thing
    const maybeInput: Element | null = maybeInputs.item(0)
    // Is the thing there? Is it of the expected type? 
    //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
    if(maybeInput == null) {
        console.log("Couldn't find input element")
    } else if(!(maybeInput instanceof HTMLInputElement)) {
        console.log(`Found element ${maybeInput}, but it wasn't an input`)
    } else {
        commandInput = maybeInput;
        // Notice that we're passing *THE FUNCTION* as a value, not calling it.
        // The browser will invoke the function when a key is pressed with the input in focus.
        //  (This should remind you of the strategy pattern things we've done in Java.)
        commandInput.addEventListener("keypress", handleKeypress);
    }
} 

// We'll use a global state reference for now
let pressCount = 0
function getPressCount() {
    return pressCount
}


function handleKeypress(event: KeyboardEvent) {    
    // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
    if (event.key === "Enter") {
        handleButton(null);
    }
    pressCount = pressCount + 1
    console.log(event.key === "Enter");
}

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export {
    handleKeypress, prepareKeypress, getPressCount, handleButton,
    briefMode, loadFile, toggleMode, view, clearHistory, unloadFile,
    search, renderHistory, historyValues, prepareButtonPress, 
    prepareHistory, prepareModeDisplay, renderModeDisplay
}
