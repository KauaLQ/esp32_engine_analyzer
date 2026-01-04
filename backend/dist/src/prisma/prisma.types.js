"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmStatus = exports.AlarmSeverity = exports.MachineStatus = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["admin"] = "admin";
    UserRole["operator"] = "operator";
    UserRole["viewer"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["active"] = "active";
    UserStatus["disabled"] = "disabled";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var MachineStatus;
(function (MachineStatus) {
    MachineStatus["operante"] = "operante";
    MachineStatus["inoperante"] = "inoperante";
    MachineStatus["manutencao"] = "manutencao";
})(MachineStatus || (exports.MachineStatus = MachineStatus = {}));
var AlarmSeverity;
(function (AlarmSeverity) {
    AlarmSeverity["info"] = "info";
    AlarmSeverity["warn"] = "warn";
    AlarmSeverity["crit"] = "crit";
})(AlarmSeverity || (exports.AlarmSeverity = AlarmSeverity = {}));
var AlarmStatus;
(function (AlarmStatus) {
    AlarmStatus["open"] = "open";
    AlarmStatus["ack"] = "ack";
    AlarmStatus["closed"] = "closed";
})(AlarmStatus || (exports.AlarmStatus = AlarmStatus = {}));
//# sourceMappingURL=prisma.types.js.map