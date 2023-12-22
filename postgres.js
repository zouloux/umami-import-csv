
export async function createSessionIfNotExists ( client, row ) {
	const query = `
		INSERT INTO session (
		  session_id,
		  website_id,
		  hostname,
		  browser,
		  os,
		  device,
		  screen,
		  language,
		  country,
		  subdivision1,
		  subdivision2,
		  city,
		  created_at
		)
		SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		WHERE NOT EXISTS (
		  SELECT 1 FROM session WHERE session_id = $1
		)
	`;

	const values = [
		row.session_id,
		row.website_id,
		row.hostname,
		row.browser,
		row.os,
		row.device,
		row.screen,
		row.language,
		row.country,
		row.subdivision1,
		row.subdivision2,
		row.city,
		row.created_at
	];
	const res = await client.query(query, values);
	return res.rowCount === 1;
}

export async function createEventIfNotExists ( client, row ) {
	const query = `
		INSERT INTO website_event (
			event_id,
			website_id,
			session_id,
			created_at,
			url_path,
			url_query,
			referrer_path,
			referrer_query,
			referrer_domain,
			page_title,
			event_type,
			event_name
		)
		SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		WHERE NOT EXISTS (
		  SELECT 1 FROM website_event WHERE event_id = $1
		)
	`;
	const values = [
		row.event_id,
		row.website_id,
		row.session_id,
		row.created_at,
		row.url_path,
		row.url_query,
		row.referrer_path,
		row.referrer_query,
		row.referrer_domain,
		row.page_title,
		row.event_type,
		row.event_name,
	];
	const res = await client.query(query, values);
	return res.rowCount === 1;
}