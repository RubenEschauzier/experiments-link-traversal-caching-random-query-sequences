"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const node_util_1 = require("node:util");
const seedrandom_1 = __importDefault(require("seedrandom"));
const { values } = (0, node_util_1.parseArgs)({
    options: {
        dir: { type: 'string', default: 'generated/out-queries' },
        min: { type: 'string', default: '25' },
        max: { type: 'string', default: '35' },
        seed: { type: 'string' }
    },
});
const targetDir = values.dir;
const minSize = parseInt(values.min, 10);
const maxSize = parseInt(values.max, 10);
if (minSize > maxSize) {
    console.error('Error: The minimum size cannot exceed the maximum size.');
    process.exit(1);
}
let rng = Math.random;
if (values.seed) {
    rng = (0, seedrandom_1.default)(values.seed);
    console.log(`Using deterministic seed: '${values.seed}'`);
}
function getSparqlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of list) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            results = results.concat(getSparqlFiles(res));
        }
        else if (res.endsWith('.sparql') && !dirent.name.startsWith('sequence_')) {
            results.push(res);
        }
    }
    return results;
}
const allQueries = [];
let originalFiles = [];
try {
    originalFiles = getSparqlFiles(targetDir);
    originalFiles.sort();
    for (const file of originalFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const queries = content
            .split(/\n\s*\n/)
            .map(q => q.trim())
            .filter(q => q.length > 0);
        allQueries.push(...queries);
    }
}
catch (err) {
    console.error(`Error reading queries from ${targetDir}:`, err);
    process.exit(1);
}
const totalQueries = allQueries.length;
if (totalQueries === 0) {
    console.error('No queries found. Verify the input directory.');
    process.exit(1);
}
console.log(`Processing ${totalQueries} total queries from ${originalFiles.length} files...`);
for (let i = totalQueries - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allQueries[i], allQueries[j]] = [allQueries[j], allQueries[i]];
}
const sequenceSizes = [];
let remaining = totalQueries;
while (remaining >= minSize) {
    const size = Math.floor(rng() * (maxSize - minSize + 1)) + minSize;
    const actualSize = Math.min(size, remaining);
    sequenceSizes.push(actualSize);
    remaining -= actualSize;
}
if (remaining > 0) {
    const deficit = minSize - remaining;
    let totalStealable = 0;
    for (const size of sequenceSizes) {
        totalStealable += (size - minSize);
    }
    if (deficit > totalStealable) {
        console.error(`Error: Cannot meet the minimum sequence size. The remaining ${remaining} queries require ${deficit} more to reach the minimum of ${minSize}, but only ${totalStealable} queries can be reassigned.`);
        process.exit(1);
    }
    sequenceSizes.push(remaining);
    const lastIndex = sequenceSizes.length - 1;
    let i = 0;
    while (sequenceSizes[lastIndex] < minSize) {
        const stealFrom = i % (sequenceSizes.length - 1);
        if (sequenceSizes[stealFrom] > minSize) {
            sequenceSizes[stealFrom]--;
            sequenceSizes[lastIndex]++;
        }
        i++;
    }
}
let queryIndex = 0;
for (let i = 0; i < sequenceSizes.length; i++) {
    const size = sequenceSizes[i];
    const sequence = allQueries.slice(queryIndex, queryIndex + size);
    const sequenceIndex = i + 1;
    const outFilePath = path.join(targetDir, `sequence_${sequenceIndex}.sparql`);
    fs.writeFileSync(outFilePath, sequence.join('\n\n'));
    console.log(`Sequence ${sequenceIndex}: ${size} queries`);
    queryIndex += size;
}
console.log(`Successfully generated ${sequenceSizes.length} sequences in ${targetDir}.`);
console.log(`Cleaning up ${originalFiles.length} original files...`);
let deletedCount = 0;
for (const file of originalFiles) {
    try {
        fs.unlinkSync(file);
        deletedCount++;
    }
    catch (err) {
        console.error(`Failed to delete file ${file}:`, err);
    }
}
console.log(`Deleted ${deletedCount} original files.`);
//# sourceMappingURL=shuffle_into_sequences.js.map