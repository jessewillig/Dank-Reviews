const router = require('express').Router();
const { User, Review } = require('../models');
const withAuth = require('../utils/auth');
const getRedditImage = require('./reddit.js');

router.get('/', async (req, res) => {
    try {
        const reviewData = await Review.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
            ],
        });

        const image = await getRedditImage()
            .then((result) => {
                return result[0]
            }).catch(err => console.log(`err: `, err))

        const reviews = reviewData.map((review) => review.get({ plain: true }));

        res.render('homepage', {
            reviews,
            logged_in: req.session.logged_in,
            image
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/reviews/:id', async (req, res) => {
    try {
        const reviewData = await Review.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
            ],
        });
        const review = reviewData.get({ plain: true });

        res.render('review', {
            ...review,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/profile', withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Review }]
        });
        
        const user = userData.get({ plain: true });
        res.render('profile', {
            ...user,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }

    res.render('login');
});

module.exports = router;