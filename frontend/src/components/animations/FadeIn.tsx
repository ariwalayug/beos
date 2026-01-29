import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0, direction = 'up', className = "", fullWidth = false }) => {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: {}
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
            style={fullWidth ? { width: '100%' } : {}}
        >
            {children}
        </motion.div>
    );
};

export default FadeIn;
