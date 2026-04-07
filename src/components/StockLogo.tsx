import { useState } from "react";

export const StockLogo = ({ symbol, name }: { symbol: string, name?: string }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        const label = name || symbol;
        return (
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=random&color=fff&size=128&length=2`}
                alt={label}
                className="w-12 h-12 rounded-xl object-cover"
            />
        );
    }

    return (
        <img
            src={`https://assets.parqet.com/logos/symbol/${symbol}?format=png`}
            alt={symbol}
            className="w-12 h-12 rounded-xl object-contain bg-white border"
            onError={() => setImageError(true)}
        />
    );
};
