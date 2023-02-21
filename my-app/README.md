# Echo

### Project Details

#### [GitHub Link](https://github.com/cs0320-s2023/sprint-2-ijeneman-nlei)
https://github.com/cs0320-s2023/sprint-2-ijeneman-nlei

### Methods

#### ``mode``
Switches the display of command history between brief and verbose. Brief displays only the command output and verbose displays both input and output. If mode to switch to is not specified, switch to other mode. Initial mode is brief.

**Command line arguments**
- (Optional) mode to switch: "Brief" or "Verbose"

**Abstracted Function: ``toggleMode()``**
- Input:
	- ``string[]``: array of arguments from command line.
- Returns:
	- ``string``: either alerting change of mode or throwing error with details.

#### ``load_file``
Loads a file from a filepath.

**Command line arguments**
- filepath: "path/to/file.csv"

**Abstracted Function: ``loadFile()``**
- Input:
	- ``string[]``: array of arguments from command line.
- Returns:
	- ``string``: either alerting file loaded or throwing error with details.

#### ``view``
Displays data from the loaded file as a table.

**Command line arguments**
- N/A

**Abstracted Function: ``view()``**
- Input:
	- ``string[]``: array of arguments from command line.
- Returns:
	- ``string``: either the HTML of the table to display or throws error with details.

#### ``search``
Searches through data in loaded file and displays resulting rows as a table

**Command line arguments**
- colId: id (name or index) of column to search
- value: value to search for in column

**Abstracted Function: ``search()``**
- Input:
	- ``string[]``: array of arguments from command line.
- Returns:
	- ``string``: either the HTML of the table of search results or throws error with details.

### Build and Run
Runs a static webpage that allows user to enter simple commands and perform basic data loading and searching.

#### Commands

Build:

``npx tsc``

Run:

Right click ``index.html`` and select "Open with Live Server" in VSCode

Test:

``npm test``

### Tests
TODO


