namespace Ecommerce.Domain.Entities;

public sealed class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Slug { get; set; }
}