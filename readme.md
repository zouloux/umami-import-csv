
# Umami import CSV

Import CSV from Umami Cloud into any custom Umami instance.

## Why

This is script can be used to import CSV from **Umami Cloud** into your **custom Umami instance**.
There is an export button on Umami Cloud but this feature does not exists in the open-source version.
So, if you need to migrate from **Umami Cloud** to an **On-Premise** version, here is a script helping you to do it.


## Usage

#### Install
- `git pull git@github.com:zouloux/umami-import-csv.git`
- `cd umami-import-csv`
- `npm i`

#### Export your CSV

Go to **Umami Cloud**, login and export the website you want to import as CSV.
Add this file into the script's directory.

#### Create website

Go to your **On-Premise Umami instance**, and create a new Website which will be imported.
Keep the created website id.

#### Setup

- Copy default config file `cp config.default.js config.js`
- Set file name or rename your CSV to match config
- Set `website.from`, it should be the exact website id in Umami Cloud ( the one you exported )
- Set `website.to`, it should be the exact website id you just created from your Umami instance
- Set postgres parameters. The script will check connection before continuing.

#### Run

- `node index.js` and follow instructions
