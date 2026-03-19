using LogiKnow.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LogiKnow.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Term> Terms => Set<Term>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookPage> BookPages => Set<BookPage>();
    public DbSet<AcademicEntry> AcademicEntries => Set<AcademicEntry>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Seed Terms
        builder.Entity<Term>().HasData(
            new Term { 
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), 
                NameEn = "Supply Chain", NameAr = "سلسلة التوريد", NameFr = "Chaîne d'approvisionnement",
                Category = "Logistics",
                DefinitionEn = "The sequence of processes involved in the production and distribution of a commodity.",
                DefinitionAr = "تسلسل العمليات التي تنطوي عليها عملية إنتاج وتوزيع السلع.",
                ExampleEn = "The computer manufacturer's supply chain spans several countries.",
                ExampleAr = "تمتد سلسلة التوريد لشركة تصنيع أجهزة الكمبيوتر عبر عدة دول.",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Term { 
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), 
                NameEn = "Warehouse", NameAr = "مستودع", NameFr = "Entrepôt",
                Category = "Storage",
                DefinitionEn = "A large building where raw materials or manufactured goods may be stored prior to their distribution for sale.",
                DefinitionAr = "مبنى كبير حيث يمكن تخزين المواد الخام أو السلع المصنعة قبل توزيعها للبيع.",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        // Seed Books
        builder.Entity<Book>().HasData(
            new Book {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "Global Logistics and Supply Chain Management",
                Authors = "[\"John Mangan\", \"Chandra Lalwani\"]",
                Year = 2016,
                Language = "en",
                Category = "Management",
                IsPublished = true,
                IsIndexedForSearch = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Book {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Title = "إدارة سلاسل الإمداد",
                Authors = "[\"أحمد الشاطر\"]",
                Year = 2020,
                Language = "ar",
                Category = "Operations",
                IsPublished = true,
                IsIndexedForSearch = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        // Seed Academic Entries
        builder.Entity<AcademicEntry>().HasData(
            new AcademicEntry {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Title = "The Impact of AI on Modern Logistics",
                Author = "Dr. Sarah Jenkins",
                University = "MIT",
                Year = 2023,
                Abstract = "This paper explores how artificial intelligence is reshaping predictive analytics in global supply chains.",
                Type = LogiKnow.Domain.Enums.AcademicEntryType.Thesis,
                Status = LogiKnow.Domain.Enums.SubmissionStatus.Approved,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
