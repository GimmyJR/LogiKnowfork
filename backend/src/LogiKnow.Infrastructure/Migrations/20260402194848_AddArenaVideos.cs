using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogiKnow.Infrastructure.Migrations
{
    public partial class AddArenaVideos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiry",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshTokenHash",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ArenaVideos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Author = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Platform = table.Column<int>(type: "int", nullable: false),
                    Views = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArenaVideos", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AcademicEntries",
                columns: new[] { "Id", "Abstract", "Author", "CreatedAt", "DocumentUrl", "Status", "SubmittedBy", "Supervisor", "Title", "Type", "University", "UpdatedAt", "Year" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), "This paper explores how artificial intelligence is reshaping predictive analytics in global supply chains.", "Dr. Sarah Jenkins", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3214), null, 1, null, null, "The Impact of AI on Modern Logistics", 0, "MIT", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3215), 2023 });

            migrationBuilder.InsertData(
                table: "ArenaVideos",
                columns: new[] { "Id", "Author", "CreatedAt", "Description", "IsPublished", "Platform", "ThumbnailUrl", "Title", "UpdatedAt", "Url", "Views" },
                values: new object[,]
                {
                    { new Guid("66666666-6666-6666-6666-666666666666"), "Ahmed - علوم النقل البحري", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3314), null, true, 0, null, "Representing the FOB Term - Funny Skit", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3314), "https://www.youtube.com/embed/dQw4w9WgXcQ", "1.2M" },
                    { new Guid("77777777-7777-7777-7777-777777777777"), "Sarah Logistics", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3318), null, true, 0, null, "Oil Prices Plummeting: Impact on Tanker Rates", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3319), "https://www.youtube.com/embed/dQw4w9WgXcQ", "850K" },
                    { new Guid("88888888-8888-8888-8888-888888888888"), "Port Captain Sims", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3322), null, true, 0, null, "Managing the Port Simulation High Score", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3323), "https://www.youtube.com/embed/dQw4w9WgXcQ", "2.1M" }
                });

            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Authors", "BlobStoragePath", "Category", "CoverUrl", "CreatedAt", "ExternalLink", "ISBN", "IsIndexedForSearch", "IsPublished", "Language", "Title", "UpdatedAt", "Year" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), "[\"John Mangan\", \"Chandra Lalwani\"]", null, "Management", null, new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3159), null, null, true, true, "en", "Global Logistics and Supply Chain Management", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3159), 2016 },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "[\"أحمد الشاطر\"]", null, "Operations", null, new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3164), null, null, true, true, "ar", "إدارة سلاسل الإمداد", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3165), 2020 }
                });

            migrationBuilder.InsertData(
                table: "Terms",
                columns: new[] { "Id", "Category", "CreatedAt", "DefinitionAr", "DefinitionEn", "ExampleAr", "ExampleEn", "IsPublished", "NameAr", "NameEn", "NameFr", "SubmittedBy", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Logistics", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(2997), "تسلسل العمليات التي تنطوي عليها عملية إنتاج وتوزيع السلع.", "The sequence of processes involved in the production and distribution of a commodity.", "تمتد سلسلة التوريد لشركة تصنيع أجهزة الكمبيوتر عبر عدة دول.", "The computer manufacturer's supply chain spans several countries.", true, "سلسلة التوريد", "Supply Chain", "Chaîne d'approvisionnement", null, new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(2997) },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Storage", new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3004), "مبنى كبير حيث يمكن تخزين المواد الخام أو السلع المصنعة قبل توزيعها للبيع.", "A large building where raw materials or manufactured goods may be stored prior to their distribution for sale.", null, null, true, "مستودع", "Warehouse", "Entrepôt", null, new DateTime(2026, 4, 2, 19, 48, 48, 280, DateTimeKind.Utc).AddTicks(3005) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArenaVideos_IsPublished",
                table: "ArenaVideos",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_ArenaVideos_Platform",
                table: "ArenaVideos",
                column: "Platform");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArenaVideos");

            migrationBuilder.DeleteData(
                table: "AcademicEntries",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Terms",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Terms",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiry",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RefreshTokenHash",
                table: "AspNetUsers");
        }
    }
}
