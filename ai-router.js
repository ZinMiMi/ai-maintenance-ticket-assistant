/**
 * AI Routing Service
 *
 * Wraps AITicketClassifier to provide department routing,
 * priority classification, and ETA estimation.
 */

class AIRouter {
  constructor() {
    this.classifier = new AITicketClassifier();
  }

  /**
   * Classify department from ticket text
   * @param {string} title
   * @param {string} description
   * @returns {Object} { value, confidence }
   */
  classifyDepartment(title, description) {
    const result = this.classifier.classify(title, description);
    return result.department;
  }

  /**
   * Classify category from ticket text
   * @param {string} title
   * @param {string} description
   * @returns {Object} { value, confidence }
   */
  classifyCategory(title, description) {
    const result = this.classifier.classify(title, description);
    return result.category;
  }

  /**
   * Classify priority from ticket text
   * @param {string} title
   * @param {string} description
   * @returns {Object} { value, confidence }
   */
  classifyPriority(title, description) {
    const result = this.classifier.classify(title, description);
    return result.priority;
  }

  /**
   * Full classification (department, category, priority, ETA)
   * @param {string} title
   * @param {string} description
   * @returns {Object} { department, category, priority, eta, confidence }
   */
  classify(title, description) {
    const result = this.classifier.classify(title, description);
    const eta = this.generateETA(result.priority.value);
    return {
      department: result.department,
      category: result.category,
      priority: result.priority,
      eta: eta,
      confidence: result.confidence
    };
  }

  /**
   * Generate estimated response time based on priority
   * @param {string} priority - critical|high|medium|low
   * @returns {string} Estimated response time
   */
  generateETA(priority) {
    const etas = {
      'critical': '30 minutes',
      'high': '2 hours',
      'medium': '4 hours',
      'low': '24 hours'
    };
    return etas[priority] || '4 hours';
  }
}

// Export for use
window.AIRouter = AIRouter;
