import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
