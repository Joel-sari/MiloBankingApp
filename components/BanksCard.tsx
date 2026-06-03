import { formatAmount } from "@/lib/utils";
import Image from "next/image";

const BanksCard = ({ account, userName, showBalance = true }: CreditCardProps) => {
  return (
    <div className="bank-card">
      <div className="bank-card_content">
        <div>
          <h3 className="text-16 font-semibold text-white">{account.name}</h3>
          <p className="text-12 text-blue-100">{account.officialName}</p>
        </div>

        <div>
          <p className="text-12 text-blue-100">{userName}</p>
          <p className="text-20 font-semibold text-white">
            {showBalance ? formatAmount(account.currentBalance) : "••••••"}
          </p>
        </div>
      </div>

      <div className="bank-card_icon">
        <Image
          src="/icons/Paypass.svg"
          width={20}
          height={24}
          alt="contactless payment"
        />
        <div className="flex flex-col items-end gap-2">
          <Image src="/icons/mastercard.svg" width={45} height={32} alt="card network" />
          <p className="text-16 pr-1 ml-3 font-semibold text-white">•••• {account.mask}</p>
        </div>
        
      </div>
    </div>
  );
};

export default BanksCard
