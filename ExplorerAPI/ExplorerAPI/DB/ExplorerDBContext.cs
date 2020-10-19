using ExplorerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ExplorerAPI.DB
{
    public class ExplorerDBContext : DbContext
    {
        public DbSet<FileModel> Files { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite("Data Source=Explorer.db");
    }
}
