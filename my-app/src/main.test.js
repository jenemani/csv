// all exports from main will now be available as main.X
import * as main from "./main";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
var tableResult1 = "<table><tr><td>1</td><td>Providence</td><td>RI</td></tr><tr><td>2</td><td>Boston</td><td>MA</td></tr><tr><td>3</td><td>Dallas</td><td>TX</td></tr><tr><td>4</td><td>Los Angeles</td><td>CA</td></tr><tr><td>5</td><td>San Francisco</td><td>CA</td></tr></table>";
var tableResult2 = "<table><tr><th>id</th><th>city</th><th>state</th></tr><tr><td>1</td><td>Providence</td><td>RI</td></tr><tr><td>2</td><td>Boston</td><td>MA</td></tr><tr><td>3</td><td>Dallas</td><td>TX</td></tr><tr><td>4</td><td>Los Angeles</td><td>CA</td></tr><tr><td>5</td><td>San Francisco</td><td>CA</td></tr></table>";
var searchResult = "<table><tr><td>4</td><td>Los Angeles</td><td>CA</td></tr><tr><td>5</td><td>San Francisco</td><td>CA</td></tr></table>";
// Sanity check
test('is 1 + 1 = 2?', function () {
    expect(1 + 1).toBe(2);
});
// *** FUNCTION UNIT TESTS ***
test("toggleMode", function () {
    // Test base case for both brief and verbose
    expect(main.toggleMode(["mode", "brief"])).toBe("Mode switched to \"Brief\"");
    expect(main.toggleMode(["mode", "verbose"])).toBe("Mode switched to \"Verbose\"");
    // Test different upper and lower cases
    expect(main.toggleMode(["mode", "BrIef"])).toBe("Mode switched to \"Brief\"");
    expect(main.toggleMode(["mode", "vERbosE"])).toBe("Mode switched to \"Verbose\"");
    // Test not specified toggle
    expect(main.toggleMode(["mode"])).toBe("Mode switched to ".concat(main.briefMode ? '"Brief"' : '"Verbose"'));
    // Test error throwing
    expect(main.toggleMode(["mode", "foo"])).toBe("Error: Unrecognized mode foo, please select either \"Brief\" or \"Verbose\"");
    expect(main.toggleMode(["mode", "foo", "bar"])).toBe("Error: incorrect number of arguments");
});
test("load_file", function () {
    // Test base case both for file with and without header
    expect(main.loadFile(["load_file", "data/noHeaderData.csv"]))
        .toBe("Loaded data/noHeaderData.csv as a CSV file with no header");
    expect(main.loadFile(["load_file", "data/headerData.csv"]))
        .toBe("Loaded data/headerData.csv as a CSV file with header");
    // Test non-existent file
    expect(main.loadFile(["load_file", "non-existent-file.csv"]))
        .toBe("Error: File not found");
    // Test wrong argument lengths
    expect(main.loadFile(["load_file"]))
        .toBe("Error: Wrong number of arguments, please only provide path to the CSV");
    expect(main.loadFile(["load_file", "arg1", "arg2", "arg3"]))
        .toBe("Error: Wrong number of arguments, please only provide path to the CSV");
});
test("view", function () {
    // Test base case both for file with and without header
    main.loadFile(["load_file", "data/noHeaderData.csv"]);
    expect(main.view(["view"])).toBe(tableResult1);
    main.loadFile(["load_file", "data/headerData.csv"]);
    expect(main.view(["view"])).toBe(tableResult2);
    // Test empty files with headers
    main.loadFile(["load_file", "data/emptyHeader.csv"]);
    expect(main.view(["view"])).toBe("<table></table>");
    main.loadFile(["load_file", "data/emptyHeaderKeys.csv"]);
    expect(main.view(["view"])).toBe("<table><tr><th>a</th></tr></table>");
    // Test empty files without headers
    main.loadFile(["load_file", "data/emptyNoHeader.csv"]);
    expect(main.view(["view"])).toBe("<table></table>");
    main.loadFile(["load_file", "data/emptyNoHeaderArr.csv"]);
    expect(main.view(["view"])).toBe("<table></table>");
    // Test argument number errors
    expect(main.view(["view", "arg1"])).toBe("Error: incorrect number of arguments");
    // Test file not loaded
    main.unloadFile();
    expect(main.view(["view"])).toBe("No file loaded");
});
test("search", function () {
    // Test cases both for file with and without header
    main.loadFile(["load_file", "data/noHeaderData.csv"]);
    // base case
    expect(main.search(["search", "0", "2"])).toBe("<table><tr><td>2</td><td>Boston</td><td>MA</td></tr></table>");
    // no results
    expect(main.search(["search", "0", "10"])).toBe("No results");
    // multiple results
    expect(main.search(["search", "2", "CA"])).toBe(searchResult);
    // errors
    expect(main.search(["search", "id", "3"])).toBe("Error: please provide column index for file without header");
    expect(main.search(["search", "10", "3"])).toBe("Error: column not found");
    main.loadFile(["load_file", "data/headerData.csv"]);
    // base case
    expect(main.search(["search", "id", "2"])).toBe("<table><tr><td>2</td><td>Boston</td><td>MA</td></tr></table>");
    // no results
    expect(main.search(["search", "id", "10"])).toBe("No results");
    // multiple results
    expect(main.search(["search", "state", "CA"])).toBe(searchResult);
    // errors
    expect(main.search(["search", "10", "3"])).toBe("Error: column not found");
    expect(main.search(["search", "foo", "2"])).toBe("Error: column not found");
    // Test empty column id error
    expect(main.search(["saerch", "", "foo"])).toBe("Error: empty column id");
    // Test wrong number of arguments
    expect(main.search(["search", "state", "MA", "arg3"])).toBe("Error: Wrong number of arguments, please provide column index/name and value to search for");
    // Test file not loaded
    main.unloadFile();
    expect(main.search(["search", "id", "3"])).toBe("Error: No file loaded, please use load_file command to load file");
});
///////////////////////////////////////////////////////////////////////////////
// *** DOM action handler testing ***
var input;
var output;
var submit;
/**
 * Pared down HTML for our testing
 */
var startingHTML = "<div class=\"repl\">\n<h2>CSV Command Line</h2>\n<h4 data-testid=\"Mode\":>Mode: <span id=\"mode\">Brief</span></h4><span>(Toggle with \"mode\" command)</span>\n<hr>\n<!-- Prepare a region of the page to hold the command history -->\n<div class=\"repl-history\" id=\"history\" data-testid=\"repl-history\">\n</div>\n<hr>\n<div class=\"repl-input\">\n  <input type=\"text\" placeholder= \"Enter Commands Here\" class=\"repl-command-box\" id=\"input\" />\n  <button type=\"button\" class=\"submit-button\" id=\"Submit Button\">Submit</button>\n</div>\n</div>";
/**
 * Resets the display before each test
 */
beforeEach(function () {
    main.clearHistory();
    main.clearHistory();
    document.body.innerHTML = startingHTML;
    main.prepareKeypress();
    main.prepareButtonPress();
    main.prepareHistory();
    main.prepareModeDisplay();
    main.renderModeDisplay();
    input = screen.getByPlaceholderText("Enter Commands Here");
    output = screen.getByTestId("repl-history");
    submit = screen.getByText("Submit");
});
/**
 * This set of tests checks that the screen is displaying what we want it to before any user interaction
 */
test("before state", function () {
    //Checks that history is empty
    expect(output.children.length).toBe(0);
    //Checks that there is no text in input (does not include placeholder)
    expect(input.textContent).toBe("");
    //Verifies that the document title is displayed
    expect(screen.queryByText("CSV Command Line")).toBeInTheDocument();
    //Verifies that the Mode: label is displayed 
    expect(screen.queryByText("Mode:")).toBeInTheDocument();
});
test("starts brief", function () {
    userEvent.type(input, "Hello");
    userEvent.click(submit);
    main.handleButton(null);
    main.renderHistory();
    //Tests that singular output is displayed 
    expect(output.children.length).toBe(1);
    //Tests that error is thrown and display is brief
    expect(output).toHaveTextContent("Invalid command");
    //Tests that mode display is up to date
    expect(screen.getByTestId("Mode")).toHaveTextContent("Mode: Brief");
});
test("switching modes", function () {
    userEvent.type(input, "mode");
    userEvent.click(submit);
    userEvent.type(input, "view");
    userEvent.click(submit);
    //Tests that history is maintained
    expect(output.children.length).toBe(2);
    //Tests that history now displays Command and Output for current and past commands
    expect(output).toHaveTextContent("Command: mode Output: Mode switched to \"Verbose\" Command: view Output: No file loaded");
    //Tests that the mode display is also updated
    expect(screen.getByTestId("Mode")).toHaveTextContent("Mode: Verbose");
    userEvent.type(input, "mode");
    userEvent.click(submit);
    //Tests that history returns to brief display for both current and past commands
    expect(output).toHaveTextContent("Mode switched to \"Verbose\" No file loaded Mode switched to \"Brief\"");
});
test("Empty Input", function () {
    userEvent.type(input, "");
    userEvent.click(submit);
    //Tests that nothing is displayed in history when nothing is submitted
    expect(output.children.length).toBe(0);
});
test("Load File", function () {
    userEvent.type(input, "load_file nope");
    userEvent.click(submit);
    //Tests that history displays error when file is not found
    expect(output).toHaveTextContent("Error: File not found");
    userEvent.type(input, "load_file data/noHeaderData.csv");
    userEvent.click(submit);
    //Tests that history displays success when file is found
    expect(output).toHaveTextContent("Loaded data/noHeaderData.csv as a CSV file with no header");
});
test("view", function () {
    userEvent.type(input, "load_file data/noHeaderData.csv");
    userEvent.click(submit);
    userEvent.type(input, "view");
    userEvent.click(submit);
    //Tests that the full CSV is displayed (not just one row)
    expect(output).toHaveTextContent("Providence");
    expect(output).toHaveTextContent("Los Angeles");
});
test("search", function () {
    userEvent.type(input, "load_file data/noHeaderData.csv");
    userEvent.click(submit);
    userEvent.type(input, "search 1 Boston");
    userEvent.click(submit);
    //Tests history displays resukt when query is present
    expect(output).toHaveTextContent("2BostonMA");
    userEvent.type(input, "search 2 Boston");
    userEvent.click(submit);
    //Tests that history displays error for when query is not present
    expect(output).toHaveTextContent("No results");
});
test("Load another file", function () {
    userEvent.type(input, "load_file data/headerData.csv");
    userEvent.click(submit);
    userEvent.type(input, "load_file data/noHeaderData.csv");
    userEvent.click(submit);
    userEvent.type(input, "search city Boston");
    userEvent.click(submit);
    //Tests original file is no longer being read
    expect(output).toHaveTextContent("please provide column index for file without header");
    userEvent.type(input, "search 1 Boston");
    userEvent.click(submit);
    //Tests new file is read
    expect(output).toHaveTextContent("2BostonMA");
});
