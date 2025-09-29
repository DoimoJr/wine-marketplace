import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WinesModule } from './wines/wines.module';
import { OrdersModule } from './orders/orders.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FavoriteSellersModule } from './favorite-sellers/favorite-sellers.module';
import { NexiModule } from './payments/nexi/nexi.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    WinesModule,
    OrdersModule,
    MessagesModule,
    AdminModule,
    UploadModule,
    WishlistModule,
    FavoriteSellersModule,
    NexiModule,
  ],
})
export class AppModule {}