class AnalyticsTemplate {
  constructor() {
    this.totalVisits = 0;
    this.uniqueVisitors = [];
    this.visitorLog = [];
  }
}

class Visit {
  constructor(visitorID) {
    this.timestamp = this.genTimestamp();
    this.visitorID = visitorID;
  }
  genTimestamp() {
    return new Date().toUTCString();
  }
}

class URL {
  constructor({userID, longURL}) {
    this._longURL = longURL;
    this.userID = userID;
    this._analytics = new AnalyticsTemplate();
  }
  get longURL() {
    return this._longURL;
  }
  set longURL (newURL) {
    this._longURL = newURL;
    this._resetAnalytics();
  }
  get uniqueVisitors() {
    return this.uniqueVisitors.length;
  }
  get analytics() {
    const {totalVisits, visitorLog} = this._analytics;
    return { totalVisits, visitorLog, uniqueVisitors: this.uniqueVisitors };
  }
  addVisit(visit) {
    this._incrementTotalVisits();
    this._addUniqueVisitor(visit.visitorID);
    this._appendVisitorLog(visit);
  }
  _isNewVisitor(visitorID) {
    return this._analytics.uniqueVisitors.filter(id => visitorID === id).length === 0;
  }
  _addUniqueVisitor(visitorID) {
    if (this._isNewVisitor(visitorID)) {
      this._analytics.uniqueVisitors.push(visitorID);
      return true;
    }
  }
  _incrementTotalVisits() {
    this._analytics.totalVisits++;
  }
  _appendVisitorLog(visit) {
    this._analytics.visitorLog.push(visit);
  }
  _resetAnalytics() {
    this._analytics = new AnalyticsTemplate;
  }
}

module.exports = {
  Visit,
  URL
};