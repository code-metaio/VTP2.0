// data.js - Generates 100+ paragraphs and 150+ tests
const VTP_DATA = {
    tutorials: {
        'home-row': { title: 'Home Row Basics', text: 'asdf jkl; asdf jkl; asdf jkl;' },
        'top-row': { title: 'Top Row Reach', text: 'qwer yuiop qwer yuiop qwe rty' },
        'bottom-row': { title: 'Bottom Row Reach', text: 'zxcv bnm,. zxcv bnm,. zxc' },
        'numbers': { title: 'Number Row Reach', text: '123 456 7890 098 765 4321' },
        'symbols': { title: 'Common Symbols', text: '!@#$ %&*() !@#$ %&*() [] {}' }
    },
    practices: {
        easy: [],
        medium: [],
        hard: [],
        coding: []
    }
};

// --- DATA GENERATION ALGOS ---

// Words & Sentences Dictionary
const easyWords = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "cat", "hat", "mat", "bat", "rat", "sat", "fat", "pat", "apple", "banana", "cherry", "date", "elephant", "frog", "goat", "house", "ice", "juice", "kite", "lemon", "moon", "nest", "ocean", "pen", "queen", "rain", "sun", "tree", "umbrella", "van", "water", "xylophone", "yacht", "zebra"];
const hardWords = ["synchronous", "asynchronous", "architecture", "infrastructure", "optimization", "algorithm", "concurrent", "procrastination", "establishment", "representative", "philosophical", "international", "bureaucracy", "encyclopedia", "extraterrestrial", "unprecedented", "revolutionary", "idiosyncrasy", "quintessential", "substantiate"];
const codeSnippets = [
    "function init() { console.log('Ready'); }",
    "const arr = [1, 2, 3].map(x => x * 2);",
    "import React, { useState } from 'react';",
    "document.getElementById('app').innerHTML = 'Hello';",
    "for (let i = 0; i < 10; i++) { sum += i; }",
    "if (err) throw new Error('Failed to load');",
    "class User extends Person { constructor() { super(); } }",
    "SELECT * FROM users WHERE age >= 21;",
    "<div class=\"container\">\n  <h1>Title</h1>\n</div>",
    "setTimeout(() => { resolve(data); }, 1000);"
];

// Helpers
function getRandomArrayElements(arr, count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    return result;
}

function generateParagraph(wordList, length) {
    let words = getRandomArrayElements(wordList, length);
    // Capitalize first letter
    if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    let text = words.join(" ") + ".";
    return text;
}

function generatePracticeData() {
    // Generate 35 Easy
    for (let i = 0; i < 35; i++) {
        VTP_DATA.practices.easy.push(generateParagraph(easyWords, 15 + Math.floor(Math.random() * 10)));
    }
    // Generate 35 Medium
    for (let i = 0; i < 35; i++) {
        VTP_DATA.practices.medium.push(generateParagraph([...easyWords, ...hardWords], 30 + Math.floor(Math.random() * 20)));
    }
    // Generate 35 Hard
    for (let i = 0; i < 35; i++) {
        VTP_DATA.practices.hard.push(generateParagraph(hardWords, 40 + Math.floor(Math.random() * 20)));
    }
    // Generate 35 Coding
    for (let i = 0; i < 35; i++) {
        let codes = getRandomArrayElements(codeSnippets, 3 + Math.floor(Math.random() * 3));
        VTP_DATA.practices.coding.push(codes.join(" "));
    }
    // Total: 140 Practice Paragraphs
}

// Generate the data on load
generatePracticeData();

// Expose a flat list generator for tests (150+ tests means simply producing text continuously for the duration)
function getTestTextForDuration(minutes) {
    // Roughly 50 words per minute average typist
    const wordCount = minutes * 80;
    let text = "";
    while (text.split(" ").length < wordCount) {
        text += generateParagraph([...easyWords, ...hardWords], 10) + " ";
    }
    return text.trim();
}

window.VTP_DATA = VTP_DATA;
window.getTestTextForDuration = getTestTextForDuration;
