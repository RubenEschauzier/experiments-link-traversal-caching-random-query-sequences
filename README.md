# My Experiment

This experiment was created with [jbr](https://github.com/rubensworks/jbr.js).

## Requirements

* [Node.js](https://nodejs.org/en/) _(1.12 or higher)_

## Installation

Before this experiment can be used, its dependencies must be downloaded first:

```bash
$ npm install
```
## Post Installation Commands

As the experiment code is undergoing review and refactoring before merging with the main code base, this experiment uses packages with different namespaces. Due to complexities with components.js and npm some slight adjustments to the node_modules must be made:

```bash
mkdir node_modules/@rubeneschauzier
cp -r node_modules/@jbr-experiment/solidbench-sequence node_modules/@rubeneschauzier &&
cp -r node_modules/sparql-query-parameter-instantiator node_modules/@rubeneschauzier &&
cp -r node_modules/rdf-dataset-fragmenter node_modules/@rubeneschauzier &&
cp -r node_modules/ldbc-snb-enhancer node_modules/@rubeneschauzier &&
cp -r node_modules/ldbc-snb-validation-generator node_modules/@rubeneschauzier 

```
## Usage
Generate the combinations:

```bash
$ npm run jbr -- generate-combinations
```
Generate the dataset and queries:

```bash
$ npm run jbr -- prepare
```

Then run the random sequence generator script which randomly shuffles the queries into sequences of
uniformly distributed size. Default size: 25-35.
The script accepts optional parameters to set the min (`--min`) and max (`--max`) size 
or specify where the query files are stored (`--dir`).
Note that to prevent the sequence built from left-over queries being tiny the actual size of the sequence
can be slightly below the min size.

```bash
npx tsc
node scripts/shuffle_into_sequences.js
```

Run the experiment locally:

```bash
$ npm run jbr -- run
```

The `output/` directory will now contain all experiment results.

## Usage if jbr is installed globally

If [jbr is installed globally](https://github.com/rubensworks/jbr.js/tree/master/packages/jbr#installation),
you can prepare and run this experiment as follows:

```bash
$ jbr prepare
$ jbr run
```
