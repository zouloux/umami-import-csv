import fs from "node:fs"
import { config } from "./config.js"
import pg from 'pg';
const { Client } = pg
import { createEventIfNotExists, createSessionIfNotExists } from "./postgres.js";

// ----------------------------------------------------------------------------- READ CSV FILE
let csv
try {
	csv = fs.readFileSync( config.file, 'utf8' )
}
catch (error) {
	console.error(`Could not read file ${config.file}.`)
	console.log( error )
	process.exit(1)
}

// Parse CSV
const regex = /(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g;
const lines = csv.split("\n")
	// Remove empty lines
	.filter( line => line !== "" )
	.map( line => {
		// Split commas and keep commas in strings
		const matches = line.match(regex) || [];
		return matches.map( col => {
			// Remove first comma
			col = col.trim()
			if ( col.startsWith(",") )
				col = col.substring(1)
			// Remove surrounding double quotes for strings
			if ( col.charAt(0) === '"' && col.charAt( col.length - 1 ) === '"')
				col = col.substring(1, col.length - 1)
			return col
		});
	}
)

// ----------------------------------------------------------------------------- CHECK HEADERS

const requiredHeaders = [
	'website_id',     'session_id',
	'event_id',       'hostname',
	'browser',        'os',
	'device',         'screen',
	'language',       'country',
	'subdivision1',   'subdivision2',
	'city',           'url_path',
	'url_query',      'referrer_path',
	'referrer_query', 'referrer_domain',
	'page_title',     'event_type',
	'event_name',     'created_at',
	'job_id' // <- not used
]

const header = lines[0]
requiredHeaders.forEach( key => {
	if ( !header.includes( key ) ) {
		console.error(`Required header ${key} is missing from this CSV file.`)
		process.exit(1)
	}
})
header.forEach( key => {
	if ( !requiredHeaders.includes( key ) ) {
		console.log(`Header ${key} has been detected from CSV file but is not handled by this script.`)
	}
})

// ----------------------------------------------------------------------------- CONVERT TO ROWS

// Convert lines to rows as objects with header as keys
const rows = lines
	.filter( (_, i) => i !== 0 )
	.map( line => {
		const object = {}
		line.forEach(( row, i ) => object[ header[i] ] = row )
		return object
	}
)

// ----------------------------------------------------------------------------- ASK FOR CONTINUE

// Connect to db
const client = new Client( config.postgres );
try {
	await client.connect();
}
catch (error) {
	console.error(`Could not connect to postres database`)
	console.log(error)
	process.exit(1)
}

console.log("Connected to Postgres.")

const continuePrompt = ( sentence = 'Do you want to continue? (y/n)' ) => new Promise((resolve) => {
	process.stdout.write( sentence );
	process.stdin.once('data', data => resolve(data.toString().trim() === 'y'));
});

const totalRows = rows.length
console.log(`${totalRows} events(s) will be processed.`)
if ( !(await continuePrompt()) )
	process.exit(0)

// ----------------------------------------------------------------------------- PROCESS TO POSTGRES

console.log(`Processing ...`)
const totalTerminalColumns = Math.floor(totalRows / process.stdout.columns)
let totalSessionsCreated = 0
let totalSessionsSkipped = 0
let totalEventsCreated = 0
let totalEventsSkipped = 0
let index = 0
for ( const row of rows ) {
	// Patch website id
	// @ts-ignore
	if ( row.website_id === config.website.from )
		// @ts-ignore
		row.website_id = config.website.to
	// Create session if not existing
	const sessionCreated = await createSessionIfNotExists( client, row );
	if ( sessionCreated )
		++totalSessionsCreated
	else
		++totalSessionsSkipped
	// Create event if not existing
	const eventCreated = await createEventIfNotExists( client, row )
	if ( eventCreated )
		++totalEventsCreated
	else
		++totalEventsSkipped
	// Increment loader into log
	++index % totalTerminalColumns === 0 && process.stdout.write("█")
}
console.log(`Finished`)
await client.end()
console.log(`${totalSessionsCreated} session(s) created / ${totalSessionsSkipped} session(s) skipped`)
console.log(`${totalEventsCreated} event(s) created / ${totalEventsSkipped} event(s) skipped`)

