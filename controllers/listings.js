const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {    
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListings = async (req, res, next) => {
    let listingData = req.body.listing;
    let url = req.file.path;
    let filename = req.find.filename;

    // 1. Naya object banane se PEHLE check karein
    if(!listingData.image || listingData.image.trim() === "") {
        // Agar link khali hai, toh image property hi hata do 
        // Taaki Mongoose apna schema wala default utha sake
        delete listingData.image; 
    } else {
        // Agar link diya hai, toh usko proper object format me set kar do
        listingData.image = { url: listingData.image, filename: "listingimage" };
    }
        
    // 2. AB safely naya instance banao
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
        
    await newListing.save();
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;

    // 2. Handle Updated Data
    let updatedListingData = { ...req.body.listing };

    // Image Handling Logic
    let url = updatedListingData.image;
    if (url && url.trim() !== "") {
        // Agar user ne nayi image link daali hai, toh usko proper object format do
        updatedListingData.image = { url: url, filename: "listingimage" };
    } else {
        // Agar user ne image field blank chhod di hai, 
        // toh use 'updatedListingData' se delete kar do taaki purani image replace na ho
        delete updatedListingData.image;
    }

    // Ab safely data update karo
    let listing = await Listing.findByIdAndUpdate(id, updatedListingData);

    if (typeof req.file !== "undefined") {
        let url = req.file.path;  // req.file se nayi URL nikalna
        let filename = req.file.filename; // req.file se naya filename nikalna
        
        listing.image = {url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};