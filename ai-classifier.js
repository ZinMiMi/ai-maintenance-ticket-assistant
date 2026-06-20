/**
 * AI Ticket Classifier
 *
 * Clean architecture for ticket classification.
 * Currently uses keyword-based analysis.
 * Ready for Claude API integration - just replace the classify() method.
 */

class AITicketClassifier {
  constructor() {
    // Keyword mappings for classification
    this.departmentKeywords = {
      'engineering': ['plumbing', 'leak', 'pipe', 'electrical', 'wiring', 'hvac', 'ac', 'heating', 'air conditioning', 'elevator', 'generator', 'maintenance', 'repair', 'broken', 'fix', 'equipment', 'machine', 'water', 'flood', 'ceiling', 'wall', 'door', 'window', 'lock'],
      'housekeeping': ['clean', 'cleaning', 'room', 'housekeeping', 'laundry', 'towel', 'linen', 'bed', 'sheet', 'trash', 'garbage', 'dust', 'vacuum', 'mop', 'bathroom', 'toilet', 'shower', 'soap', 'amenity', 'supplies'],
      'front-office': ['check-in', 'check-out', 'reception', 'reservation', 'booking', 'guest', 'lobby', 'concierge', 'bell', 'luggage', 'key card', 'phone', 'call', 'complaint', 'review', 'feedback'],
      'it': ['wifi', 'internet', 'network', 'computer', 'tv', 'television', 'remote', 'system', 'software', 'login', 'password', 'printer', 'phone', 'technical', 'server', 'connection', 'bluetooth'],
      'fb': ['food', 'restaurant', 'kitchen', 'meal', 'breakfast', 'dinner', 'lunch', 'bar', 'drink', 'catering', 'menu', 'room service', 'buffet', 'coffee', 'minibar', 'refrigerator'],
      'security': ['security', 'safety', 'alarm', 'camera', 'surveillance', 'access', 'badge', 'key', 'lock', 'theft', 'stolen', 'emergency', 'fire', 'smoke', 'intruder', 'suspicious'],
      'hr': ['staff', 'employee', 'training', 'schedule', 'shift', 'uniform', 'hire', 'interview', 'payroll', 'benefits', 'policy', 'harassment', 'complaint'],
      'finance': ['bill', 'invoice', 'payment', 'charge', 'refund', 'receipt', 'accounting', 'budget', 'expense', 'procurement', 'purchase', 'vendor', 'contract']
    };

    this.categoryKeywords = {
      'plumbing': ['leak', 'pipe', 'drain', 'toilet', 'faucet', 'sink', 'water', 'flood', 'clog', 'block', 'sewage', 'drip'],
      'electrical': ['light', 'lamp', 'outlet', 'switch', 'wiring', 'circuit', 'breaker', 'power', 'electric', 'spark', 'fuse'],
      'hvac': ['ac', 'air conditioning', 'heating', 'thermostat', 'temperature', 'cold', 'hot', 'ventilation', 'fan', 'hvac', 'humid'],
      'structural': ['wall', 'ceiling', 'floor', 'door', 'window', 'crack', 'paint', 'tile', 'roof', 'foundation', 'stairs'],
      'appliance': ['tv', 'television', 'remote', 'refrigerator', 'minibar', 'coffee', 'iron', 'hairdryer', 'phone', 'safe', 'microwave'],
      'other': []
    };

    this.priorityKeywords = {
      'critical': ['emergency', 'flood', 'fire', 'smoke', 'gas', 'leak', 'danger', 'safety', 'urgent', 'immediately', 'broken lock', 'no water', 'no power', 'injury'],
      'high': ['urgent', 'asap', 'important', 'broken', 'not working', 'cannot', 'won\'t', 'stuck', 'damage', 'loud', 'noise'],
      'medium': ['issue', 'problem', 'needs', 'should', 'request', 'please', 'fix', 'repair', 'replace'],
      'low': ['minor', 'small', 'cosmetic', 'whenever', 'convenience', 'suggestion', 'improvement', 'nice to have']
    };
  }

  /**
   * Classify a ticket description
   * @param {string} title - Ticket title
   * @param {string} description - Ticket description
   * @returns {Object} Classification result with department, category, priority and confidence
   */
  classify(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const department = this.detectDepartment(text);
    const category = this.detectCategory(text);
    const priority = this.detectPriority(text);

    return {
      department: department,
      category: category,
      priority: priority,
      confidence: this.calculateConfidence(department, category, priority)
    };
  }

  detectDepartment(text) {
    const scores = {};

    for (const [dept, keywords] of Object.entries(this.departmentKeywords)) {
      scores[dept] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return { value: 'engineering', confidence: 0.3 };

    const best = Object.entries(scores).find(([, score]) => score === maxScore);
    return {
      value: best[0],
      confidence: Math.min(0.5 + (maxScore * 0.15), 0.95)
    };
  }

  detectCategory(text) {
    const scores = {};

    for (const [cat, keywords] of Object.entries(this.categoryKeywords)) {
      if (cat === 'other') continue;
      scores[cat] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return { value: 'other', confidence: 0.3 };

    const best = Object.entries(scores).find(([, score]) => score === maxScore);
    return {
      value: best[0],
      confidence: Math.min(0.5 + (maxScore * 0.15), 0.95)
    };
  }

  detectPriority(text) {
    // Check critical first
    const criticalMatches = this.priorityKeywords['critical'].filter(k => text.includes(k)).length;
    if (criticalMatches > 0) {
      return { value: 'critical', confidence: Math.min(0.7 + (criticalMatches * 0.1), 0.95) };
    }

    // Check high
    const highMatches = this.priorityKeywords['high'].filter(k => text.includes(k)).length;
    if (highMatches > 0) {
      return { value: 'high', confidence: Math.min(0.6 + (highMatches * 0.1), 0.9) };
    }

    // Check low
    const lowMatches = this.priorityKeywords['low'].filter(k => text.includes(k)).length;
    if (lowMatches > 0) {
      return { value: 'low', confidence: Math.min(0.5 + (lowMatches * 0.1), 0.85) };
    }

    // Default to medium
    return { value: 'medium', confidence: 0.4 };
  }

  calculateConfidence(department, category, priority) {
    return Math.round(
      ((department.confidence + category.confidence + priority.confidence) / 3) * 100
    );
  }
}

// Export for use - ready for Claude API replacement
window.AITicketClassifier = AITicketClassifier;
