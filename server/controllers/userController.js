const User = require("../models/userModel")
//get status 
exports.getStats = async (req, res) => {
    try {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ status: "Active" })
        const inactive = await User.countDocuments({ status: "Inactive" })

        res.json({ total, active, inactive });
    } catch (error) {
        res.status(500).json({ message: "Error fetch Statistics", error: error.message })
    }

}

//search users
exports.searchUsers = async (req, res) => {
    try {
        const query = req.params.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit
        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phone: { $regex: query, $options: "i" } },
                { status: { $regex: query, $options: "i" } }
            ],
        }
        const users = await User.find(this.searchQuery).sort({
            createdAt: -1
        }).skip(skip).limit(limit)

        const total = await User.countDocuments(searchQuery)

        res.json({
            users, currentPage: page, totalPages: Math.ceil(total / limit),
            totalUsers: total
        })

    } catch (error) {
        res.status(500).json({ message: "Error fetch Statistics", error: error.message })
    }
}


//get all users
exports.getAllUsers = async (req, res) => {
    try {


        const query = req.params.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit
        const users = await User.find().sort({
            createdAt: -1
        }).skip(skip).limit(limit)
        const total = await User.countDocuments()
        res.json({
            users, currentPage: page, totalPages: Math.ceil(total / limit),
            totalUsers: total
        })
    } catch (error) {
        res.status(500).json({ message: "Error fetch Statistics", error: error.message })
    }
}


//get single user
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: "user not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetch Statistics", error: error.message })
    }
}


//create user
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, status } = req.body;

        // Validate required fields
        if (!name?.trim() || !email?.trim() || !phone?.trim()) {
            return res.status(400).json({
                message: "Name, email and phone are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Create user
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            status: status || "Active"
        });

        await user.save();

        return res.status(201).json(user);

    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: "Error creating user",
            error: error.message
        });
    }
};

//update user

exports.updateUser = async (req, res) => {
    try {
        const { name, phone, email, status } = req.body;
        if (email) {
            const exists = await User.find({ email, _id: { $ne: req.params.id } })
            if (exists.length>0) {
                return res.status(400).json({ message: "Email Already Exists" })
            }
        }
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone, status }, { new: true, runValidators: true })

        if(!user) return res.status(404).json({message:"User not found"})
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetch Statistics", error: error.message })
    }

}