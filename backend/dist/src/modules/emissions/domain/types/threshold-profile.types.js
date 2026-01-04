"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmissionInputsFromProfile = getEmissionInputsFromProfile;
function getEmissionInputsFromProfile(payload) {
    const fp = Number(payload?.nominais?.assumptions?.fp ?? 0.85);
    const eta = Number(payload?.nominais?.assumptions?.eta ?? 0.90);
    const vrmsNom = Number(payload?.nominais?.vrms_nominal_v ?? payload?.regime?.vrms_nominal_v ?? 220);
    const irmsNom = payload?.nominais?.irms_nominal_a != null ? Number(payload.nominais.irms_nominal_a) : null;
    return { fp, eta, vrmsNom, irmsNom };
}
//# sourceMappingURL=threshold-profile.types.js.map