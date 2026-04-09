interface Uiconfig {
    label : string;
    icon : string;
    color : string;
    badgeClass : string;
    dotClass : string;
}
interface KioskChargingProps {
    chargerId : string;
    uiConfig : string;
}

const KioskCharging = ({chargerId, uiconfig} : KioskChargingProps) => {
    return(
        <div className="flex flex-col items-center gap-6 text-center">
            <span className="text-6x1 animate-pulse">{uiconfig.icon}</span>
            <p className="text-2xl font-extrabold text-white">충전 중입니다.</p>
            <p className="text-sm text-white/50">{uiConfig.label} · 충전기 {chargerId}</p>
        </div>
    );
};

export default KioskCharging;