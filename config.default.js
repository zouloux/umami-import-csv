
export const config = {
	file: "umami.csv",
	website: {
		from: "", 	// website_id from CSV file
		to: "", 	// website_id in database
	},
	postgres: {
		host: "localhost",
		port: 5432,
		user: "",
		password: "",
		database: "",
	}
}
