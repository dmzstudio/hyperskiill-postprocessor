/**
 * Project: Postprocessor, Stage 3 Code
 */

// Write your code here
const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

const inputFilePath = 'database.csv';
const hashOutputFilePath = 'hash_database.csv';
const filterOutputFilePath = 'filtered_database.csv';

const hashPassword = (password) => {
	const hash = crypto.createHash('sha256');
	hash.update(password);
	return hash.digest('hex');
};

// Stage 2 Code
const processHashCsv = () => {
	const r1 = readline.createInterface({
		input: fs.createReadStream(inputFilePath),
		crlfDelay: Number.POSITIVE_INFINITY,
	});

	const hashWriteStream = fs.createWriteStream(hashOutputFilePath);
	hashWriteStream.write('id, nickname, password, consent to mailing\n');
	let isFirstLine = true;

	// Read the file line by line
	r1.on('line', (line) => {

		if (isFirstLine) {
			console.log('Skipping header line.');
			isFirstLine = false;
			return;
		}

		// Split the csv line into an array of values
		const [id, nickname, password, consentToMailing] = line.split(', ').map((value) => value.trim());

		// Hash the password
		const hashedPassword = hashPassword(password);

		// Write the hashed password directly to the output file
		hashWriteStream.write(`${id}, ${nickname}, ${hashedPassword}, ${consentToMailing}\n`);
	});

	// Listen for the 'error' event on the write stream
	hashWriteStream.on('error', (err) => {
		console.error('Error writing to output file:', err);
	});

	// Listen for the 'close' event to know when reading is complete
	r1.on('close', () => {

		// Close the write stream
		hashWriteStream.end();

		console.log('Hashed data written to hash_database.csv');
		console.log('CSV processing complete.');
	});

	// Handle errors
	r1.on('error', (err) => {
		console.error('Error reading input file:', err);
	});

	hashWriteStream.on('error', (err) => {
		console.error('Error writing to output file:', err);
	});
};


// Stage 3 Code
const processFilterCsv = () => {
	const r2 = readline.createInterface({
		input: fs.createReadStream(inputFilePath),
		crlfDelay: Number.POSITIVE_INFINITY,
	});

	const filterWriteStream = fs.createWriteStream(filterOutputFilePath);
	filterWriteStream.write('id, nickname, password, consent to mailing\n');

	let isFirstLine = true;  // Used to make sure the header row is only written once
	let filteredEntriesCount = 0;  // Counter for the number of entries filtered out
	let newIndexValue = 1; // Counter for the new index value of a shifted entry

	// Read the file line by line
	r2.on('line', (line) => {
		if (isFirstLine) {
			console.log('Skipped header line.');
			isFirstLine = false;
			return;
		}

		// Split csv line into an array of values
		const [id, nickname, password, consentToMailing] = line.split(', ').map((value) => value.trim());

		// Filter rows with missing content
		if (nickname === '-' || consentToMailing === '-') {
			filteredEntriesCount++;
			return;
		}

		// Hash the password
		const hashedPassword = hashPassword(password);

		// Write row to output file
		filterWriteStream.write(`${newIndexValue}, ${nickname}, ${hashedPassword}, ${consentToMailing}\n`);
		newIndexValue++;
	});

	// Listen for the 'close' event on the write stream
	r2.on('close', () => {
		// Close the write stream
		filterWriteStream.end();

		console.log('Filtered incomplete entries from database.csv, hashed the passwords, wrote data to filtered_database.csv with updated indices.');
		console.log(`Number of entries skipped: ${filteredEntriesCount}`);
		console.log('CSV processing complete.');
	});

	// Handle errors
	r2.on('error', (err) => {
		console.error('Error reading input file:', err);
	});

	// Listen for the 'error' event on the write stream
	filterWriteStream.on('error', (err) => {
		console.error('Error writing to output file:', err);
	});
}

// Execute the CSV processing
processHashCsv();
processFilterCsv();