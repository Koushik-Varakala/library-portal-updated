const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./models/Book");

dotenv.config();

const books = [
    {
        title: "Thermodynamics: An Engineering Approach",
        author: "Yunus A. Çengel",
        category: "Mechanical",
        description: "A comprehensive guide to the basic principles of thermodynamics.",
        totalCopies: 10,
        availableCopies: 10,
    },
    {
        title: "Electric Machinery Fundamentals",
        author: "Stephen J. Chapman",
        category: "Electrical",
        description: "Best-selling text for electric machinery and transformers.",
        totalCopies: 8,
        availableCopies: 8,
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        category: "Business",
        description: "A personal finance book about investing and building weath.",
        totalCopies: 15,
        availableCopies: 15,
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        category: "Non-fiction",
        description: "A history of humankind from the Stone Age to the twenty-first century.",
        totalCopies: 12,
        availableCopies: 12,
    },
    {
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        description: "A dystopian social science fiction novel and cautionary tale.",
        totalCopies: 20,
        availableCopies: 20,
    },
    {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        description: "A landmark volume in science writing by one of the great minds of our time.",
        totalCopies: 5,
        availableCopies: 5,
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Technology",
        description: "A Handbook of Agile Software Craftsmanship.",
        totalCopies: 7,
        availableCopies: 7,
    },
    {
        title: "Design of Machine Elements",
        author: "V.B. Bhandari",
        category: "Mechanical",
        description: "Comprehensive coverage of current design practices in mechanical engineering.",
        totalCopies: 6,
        availableCopies: 6,
    },
    {
        title: "Microelectronic Circuits",
        author: "Adel S. Sedra",
        category: "Electrical",
        description: "Reference for modern semiconductor technology and analog circuits.",
        totalCopies: 9,
        availableCopies: 9,
    },
    {
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "Business",
        description: "How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.",
        totalCopies: 11,
        availableCopies: 11,
    },
];

const seedBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected for Seeding");

        // Optional: clear existing books to avoid duplicates if re-running
        // await Book.deleteMany(); 
        // console.log("Cleared existing books");

        // Check for existing books to specific titles to avoid duplicates without clearing everything
        for (const book of books) {
            const exists = await Book.findOne({ title: book.title });
            if (!exists) {
                await Book.create(book);
                console.log(`Added: ${book.title}`);
            } else {
                console.log(`Skipped (Already exists): ${book.title}`);
            }
        }

        console.log("Seeding Completed Successfully");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedBooks();
