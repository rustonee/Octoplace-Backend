CREATE TABLE `octoplace`.`octouser` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `WalletAddress` VARCHAR(200) NOT NULL,
    `Name` VARCHAR(100) NULL,
    `AboutText` VARCHAR(500) NULL,
    `BannerImage` BLOB NULL,
    `Avatar` BLOB NULL,
    `Facebook` VARCHAR(100) NULL,
    `Twitter` VARCHAR(100) NULL,
    `Instagram` VARCHAR(100) NULL,
    `Discord` VARCHAR(100) NULL,
    `TikTok` VARCHAR(100) NULL,
    `Youtube` VARCHAR(100) NULL,
    `Medium` VARCHAR(100) NULL,
    PRIMARY KEY (`Id`),
    UNIQUE INDEX `WalletAddress_UNIQUE` (`WalletAddress` ASC)
);