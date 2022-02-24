class Visit {
  constructor({timestamp, visitorID}) {
    this.timestamp = timestamp;
    this.visitorID = visitorID;
  }
}

class URL {
  constructor({userID, longURL}) {
    this.longURL = longURL;
    this.userID = userID;
    this._analytics = {
      totalVisits : 0,
      uniqueVisitors: {},
      visitorLog: []
    };
  }
  get uniqueVisitors() {
    return Object.keys(this._analytics.uniqueVisitors).length;
  }
  onVisit(visit) {

  }
  _isNewVisitor() {
    
  }
  _addUniqueVisitor(visitorID) {

  }
  _incrementTotalVisits() {
    this._analytics.totalVisits++;
  }
  _addVisit(visit) {
    this._analytics.visitorLog.push(visit);
  }
}

module.exports = {
  Visit,
  URL
};