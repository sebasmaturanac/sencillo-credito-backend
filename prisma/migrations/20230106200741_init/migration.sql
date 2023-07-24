-- CreateTable
CREATE TABLE `AvailableApp` (
    `nombre` ENUM('APP_MOVIL', 'APP_ADMIN') NOT NULL DEFAULT 'APP_MOVIL',

    UNIQUE INDEX `AvailableApp_nombre_key`(`nombre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `comercializadoraId` INTEGER NULL,
    `loggedIn` BOOLEAN NOT NULL DEFAULT false,
    `lastLogin` DATETIME(3) NULL,
    `role` ENUM('VENDEDOR', 'COMERCIALIZADORA', 'AUTORIZADOR', 'SUPERUSER') NOT NULL DEFAULT 'VENDEDOR',
    `pushNotificationToken` VARCHAR(191) NULL,
    `pushNotificationTokenUpdatedAt` DATETIME(3) NULL,
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `suspendedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAvailableApp` (
    `availableAppNombre` ENUM('APP_MOVIL', 'APP_ADMIN') NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`availableAppNombre`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Entidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('BANCO', 'INSTITUCION') NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoConsulta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` ENUM('PRESTAMO', 'ELECTRODOMESTICO') NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttachmentFile` (
    `mimetype` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `pedidoId` INTEGER NOT NULL,

    PRIMARY KEY (`pedidoId`, `target`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `sexo` ENUM('MASCULINO', 'FEMENINO', 'NO_BINARIO') NOT NULL,
    `permitirNuevoPedido` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cliente_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `montoSolicitado` DECIMAL(10, 2) NOT NULL,
    `comentarioVendedor` VARCHAR(255) NULL,
    `numeroPedido` VARCHAR(191) NOT NULL,
    `regalia` INTEGER NULL,
    `regaliaCobrada` BOOLEAN NULL,
    `clienteId` INTEGER NOT NULL,
    `entidadId` INTEGER NOT NULL,
    `creadoPorId` INTEGER NOT NULL,
    `tipoConsultaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pedido_numeroPedido_key`(`numeroPedido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoEstado` (
    `estado` ENUM('PENDIENTE', 'PENDIENTE_DE_MARGEN', 'PENDIENTE_DE_MARGEN_OK', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `enRevision` BOOLEAN NOT NULL DEFAULT false,
    `montoAutorizado` DECIMAL(10, 2) NULL,
    `cantidadCuotas` INTEGER NULL,
    `montoCuota` DECIMAL(10, 2) NULL,
    `comentario` VARCHAR(255) NULL,
    `fecha` DATETIME(3) NULL,
    `pedidoId` INTEGER NOT NULL,
    `autorizadorId` INTEGER NULL,

    PRIMARY KEY (`pedidoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoComision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DECIMAL(10, 2) NOT NULL,
    `porcentaje` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('COBRADO', 'NO_COBRADO') NOT NULL DEFAULT 'NO_COBRADO',
    `cobradoAt` DATETIME(3) NULL,
    `pedidoId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PedidoComision_pedidoId_key`(`pedidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(191) NOT NULL,
    `idTarget` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,

    INDEX `Logs_userId_idTarget_idx`(`userId`, `idTarget`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(512) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersHasMessages` (
    `messageId` INTEGER NOT NULL,
    `senderUserId` INTEGER NOT NULL,
    `destinationUserId` INTEGER NOT NULL,
    `conversationThread` VARCHAR(191) NOT NULL,
    `isReaded` BOOLEAN NOT NULL DEFAULT false,
    `readedAt` DATETIME(3) NULL,

    PRIMARY KEY (`messageId`, `senderUserId`, `destinationUserId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_comercializadoraId_fkey` FOREIGN KEY (`comercializadoraId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAvailableApp` ADD CONSTRAINT `UserAvailableApp_availableAppNombre_fkey` FOREIGN KEY (`availableAppNombre`) REFERENCES `AvailableApp`(`nombre`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAvailableApp` ADD CONSTRAINT `UserAvailableApp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttachmentFile` ADD CONSTRAINT `AttachmentFile_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_entidadId_fkey` FOREIGN KEY (`entidadId`) REFERENCES `Entidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_tipoConsultaId_fkey` FOREIGN KEY (`tipoConsultaId`) REFERENCES `TipoConsulta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoEstado` ADD CONSTRAINT `PedidoEstado_autorizadorId_fkey` FOREIGN KEY (`autorizadorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoEstado` ADD CONSTRAINT `PedidoEstado_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoComision` ADD CONSTRAINT `PedidoComision_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoComision` ADD CONSTRAINT `PedidoComision_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersHasMessages` ADD CONSTRAINT `UsersHasMessages_senderUserId_fkey` FOREIGN KEY (`senderUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersHasMessages` ADD CONSTRAINT `UsersHasMessages_destinationUserId_fkey` FOREIGN KEY (`destinationUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersHasMessages` ADD CONSTRAINT `UsersHasMessages_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
