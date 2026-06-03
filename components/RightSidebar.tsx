import Image from "next/image"
import Link from "next/link"
import BanksCard from "./BanksCard"

const RightSidebar = ({ user, banks }: RightSidebarProps) => {
  const userName = `${user.firstName} ${user.lastName}`;
  const cardOffset = 72;
  const cardHeight = 192;

  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">
              {user.firstName[0]}
            </span>
          </div>
          <div className="profile-details">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-email"> {user.email} </p>
          </div>
        </div>
      </section>
      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Banks</h2>
          <Link href="/" className="flex gap-2">
            <Image
              src="/icons/plus.svg"
              width={20}
              height={20}
              alt="Add Bank"
            />
            <h2 className="text-14 mt-0.75 font-semibold text-gray-600">
              Add Bank
            </h2>
          </Link>
        </div>
        {banks.length > 0 && (
          <div
            className="relative w-full max-w-[320px] self-center"
            style={{ height: cardHeight + (banks.length - 1) * cardOffset }}
          >
            {banks.map((account, index) => (
              <div
                key={account.id}
                className="absolute inset-x-0 transition-transform"
                style={{
                  top: index * cardOffset,
                  zIndex: banks.length - index,
                  transform: `scale(${1 - index * 0.025})`,
                  transformOrigin: "top center",
                }}
              >
                <BanksCard account={account} userName={userName} />
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

export default RightSidebar
